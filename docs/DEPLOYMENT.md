# MIMT — Runbook de publication

**Dernière révision :** 2026-10-14 · Actuellement, **aucun déploiement du dernier SHA n'est démontré**.

## A. Site Web statique : GitHub → CI → artéfact → hébergement

- Source : `apps/web/`, Node 22, pnpm 10, Next.js export statique.
- CI : `.github/workflows/ci.yml` compile et teste, vérifie **28 routes** et publie `mimt-web-static` après push `main`.
- CD : `.github/workflows/deploy-web.yml` accepte seulement une CI réussie du dernier SHA `main`.
- Hébergeur : **inconnu tant que DNS, racine de document et compte de contrôle ne sont pas vérifiés**. Ne pas déduire que le compte MochaHost d'un autre site est automatiquement celui de MIMT.
- Sécurité : pas de `force-push`; CD désactivé sauf variable `MIMT_WEB_DEPLOY_ENABLED=true`; marqueur distant `.mimt-web-managed` obligatoire; répertoire dédié `/home/<user>/...`.

### Paramètres GitHub Actions nécessaires

Variables : `MIMT_WEB_FORMS_ENDPOINT` (seulement après vérification de l'API), `MIMT_WEB_DEPLOY_ENABLED`, `MIMT_WEB_HOST`, `MIMT_WEB_PORT`, `MIMT_WEB_USER`, `MIMT_WEB_REMOTE_DIR`. Secrets : `MIMT_WEB_SSH_PRIVATE_KEY`, `MIMT_WEB_KNOWN_HOSTS`.

1. Inspecter dans l'hébergement réel de `mimt.ca` le chemin exact de la racine documentaire et son contenu. Sauvegarder le site en place.
2. Comparer les pages du site actif aux 28 routes GitHub (spécialement IA, comparateur, App Web) et préserver les fonctionnalités non encore réintégrées.
3. Vérifier la clé publique SSH de l'hôte par un canal fiable, configurer secrets et variables GitHub; placer le fichier vide `.mimt-web-managed` dans **la bonne racine**.
4. Configurer le service de formulaires seulement si l'API et sa DB sont validées; `NEXT_PUBLIC_FORMS_ENDPOINT` doit être une URL HTTPS publique, sans jeton. Sinon repli `mailto:`.
5. Activer le drapeau une fois la cible vérifiée. Un push `main` déclenchera CI et, si vert, la publication de l'artéfact.
6. Vérifier `https://mimt.ca/deploy-version.txt` == SHA de la CI; parcourir `/en/`, `/ia/`, `/comparer/`, `/app-web/` et les formulaires.

**Rollback :** conserver une archive datée complète de la racine existante avant la première bascule. Pour une révision ultérieure, re-déployer un artéfact du commit antérieur **après revue et publication d'un nouveau commit de retour arrière**. Ne pas mettre à jour `main` avec un `force-push`.

## B. API : Coolify ou serveur vérifié

- Source : `apps/api/Dockerfile`, contexte racine, port interne 8080, TLS sur `https://api.mimt.ca`.
- Préparer Supabase MIMT dédié, région Canada; créer les rôles/buckets requis. Appliquer les migrations `0001`, `0002`, `0003`, `0004` dans l'ordre et effectuer une lecture de la structure/RLS.
- Injecter les variables documentées dans `apps/api/.env.example` via coffre-fort de l'hébergeur. La validation en `NODE_ENV=production` doit refuser les secrets manquants.
- Protéger Twilio Voice et Stripe par signatures, configurer plafonds d'opérateur et permissions géographiques.
- Vérifier `GET /healthz`, `GET /readyz` puis tester des messages/numéros bêta contrôlés. Pour le public, `POST /v1/public/leads` exige l'en-tête `Origin: https://mimt.ca`; aucun accès anonyme à la table en SQL/API Supabase.
- **Ne pas tester le vrai 911 pour une validation technique.** Utiliser uniquement la méthode de test fournisseur validée.
- Configurer les variables publiques du build Web pour poster vers `https://api.mimt.ca/v1/public/leads` seulement après la disponibilité réelle du service.

## C. Gate production

Lancement interdit sans : backup/restore, CI verte, migrations validées, tests auth et consentement, monitoring, revue juridique de l'avis 9-1-1, validation chez transporteur, preuve du SHA servi et procédure d'incident. Les tests avancés peuvent suivre, jamais les contrôles de sécurité critiques.

## D. Déploiement automatisé de l'API (désactivé par défaut)

Le workflow `.github/workflows/deploy-api.yml` déclenche un **déploiement Coolify de la seule ressource API MIMT** après une CI verte sur `main`, puis attend le statut de fin, vérifie le commit déployé et interroge `https://api.mimt.ca/readyz` (base, Twilio, Stripe). Il reste ignoré tant que `MIMT_API_DEPLOY_ENABLED` n'est pas `true`.

Paramètres : variable GitHub `MIMT_API_DEPLOY_ENABLED`; secrets `MIMT_COOLIFY_DEPLOY_WEBHOOK` (URL exacte de la ressource MIMT) et `MIMT_COOLIFY_DEPLOY_TOKEN` (jeton limité à la permission `deploy`). Ne configurer qu'après avoir créé l'application Coolify pour `main`, avec `apps/api/Dockerfile` et le port interne `8080`, les migrations et les secrets API. Un déclenchement du webhook n'est jamais considéré comme une publication réussie sans contrôle de révision et de santé.

Références : documentation officielle Coolify Deploy Webhooks et Get Deployment by UUID.

**État des accès (2026-10-14) :** la connexion Supabase accessible ne contient pas de projet nommé MIMT. Il est interdit d'appliquer les migrations MIMT à TAKATAK STAGING ou à un projet d'un autre produit. Il faut d'abord créer/identifier le projet Supabase dédié à MIMT et vérifier qu'il appartient à la bonne organisation.
