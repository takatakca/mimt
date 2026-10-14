# MIMT — Runbook de publication

**Dernière révision :** 2026-10-14 · Actuellement, **aucun déploiement du dernier SHA n'est démontré**.

## A. Site Web statique : GitHub → CI → artéfact → hébergement

- Source : `apps/web/`, Node 22, pnpm 10, Next.js export statique.
- CI : `.github/workflows/ci.yml` compile et teste, vérifie **28 routes** et publie `mimt-web-static` après push `main`.
- CD : `.github/workflows/deploy-web.yml` accepte seulement une CI réussie du dernier SHA `main`.
- Hébergeur : **inconnu tant que DNS, racine de document et compte de contrôle ne sont pas vérifiés**. Ne pas déduire que le compte MochaHost d'un autre site est automatiquement celui de MIMT.
- Sécurité : pas de `force-push`; CD désactivé sauf variable `MIMT_WEB_DEPLOY_ENABLED=true`; marqueur distant `.mimt-web-managed` obligatoire; répertoire dédié `/home/<user>/...`.

### Paramètres GitHub Actions nécessaires

Variables : `MIMT_WEB_FORMS_ENDPOINT` (seulement après vérification de l'API), `MIMT_WEB_DEPLOY_ENABLED`, `MIMT_WEB_PARITY_REVIEWED`, `MIMT_WEB_HOST`, `MIMT_WEB_PORT`, `MIMT_WEB_USER`, `MIMT_WEB_REMOTE_DIR`. Secrets : `MIMT_WEB_SSH_PRIVATE_KEY`, `MIMT_WEB_KNOWN_HOSTS`.

1. Inspecter dans l'hébergement réel de `mimt.ca` le chemin exact de la racine documentaire et son contenu. Sauvegarder le site en place.
2. Comparer les pages du site actif aux 28 routes GitHub (spécialement IA, comparateur, App Web) et préserver les fonctionnalités non encore réintégrées.
3. Vérifier la clé publique SSH de l'hôte par un canal fiable, configurer secrets et variables GitHub; placer le fichier `.mimt-web-managed` dont le contenu doit être **`mimt.ca`** dans **la bonne racine**.
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

### Sécurité de publication WEB-01

Le drapeau `MIMT_WEB_PARITY_REVIEWED` ne peut passer à `true` qu'après revue de la parité du site public (voir [WEB_PARITY_AUDIT.md](WEB_PARITY_AUDIT.md)), y compris l'anglais, et confirmation des exclusions intentionnelles des promesses IA. Le marqueur `.mimt-web-managed` doit contenir **exactement** le texte `mimt.ca`; un fichier vide n'est plus accepté.

Chaque déploiement conserve un snapshot distant sous `/home/<SSH USER>/.mimt-web-backups/<SHA>/`, puis copie l'artéfact avec `--backup` **sans `--delete`**. Les fichiers uniquement présents en production restent en place. L'absence d'espace disque suffisant ou un échec de sauvegarde doit faire échouer la publication, pas contourner le contrôle. Après déploiement, comparer le SHA réellement servi et surveiller les erreurs HTTP.

### Vérification CI avant publication (WEB-01)

Le script `node apps/web/scripts/check-export.mjs` valide toutes les 28 routes statiques et leurs alternances de langue, le sitemap, la page 404, les éléments exportés et les avis de pré-lancement et 9-1-1 des pages publiques critiques. Il a réussi dans GitHub Actions au SHA `aaa8b629` (run 38624276434). **Cela ne valide pas une installation de téléphonie réelle ni un déploiement live.**

## Contrôles ajoutés à cette reprise

- Le pipeline CI vérifie désormais les liens internes et les ancres de toutes les pages HTML via `node apps/web/scripts/check-links.mjs` après l'export (avec tests isolés : `node --test apps/web/scripts/check-links.test.mjs`). Preuve : GitHub Actions `38625918929`, succès.
- **Reverse proxy API :** `TRUSTED_PROXY_CIDRS` est vide par défaut : `X-Forwarded-For` n'est pas pris en compte comme adresse client. Après avoir identifié l'IP réelle du proxy immédiatement devant l'API, configurer **uniquement** son IP/CIDR dans le coffre-fort Coolify. Le programme refuse les entrées non valides et les CIDR tous réseaux `0.0.0.0/0`, `::/0`; ne pas deviner un réseau Docker partagé. Test CI `38626239265`, succès.
- Les limites de requêtes par IP ne sont pas distribuées entre plusieurs instances Fastify; prévoir un magasin central ou maintenir une seule instance surveillée. Les routes Twilio/Stripe requièrent toujours la vérification de signature.
- Les workflows Web et API du dernier commit technique `319e8794` sont ignorés (`skipped`). Cette modification ne constitue ni lancement commercial, ni validation de routage du 9-1-1.

## WEB-04 — vérificateur de liens (2026-10-14)

Le validateur HTML doit distinguer les vrais attributs `href` et `id` de `data-href` et `data-id`. Trois tests supplémentaires passent localement (7/7), **sans preuve de CI complète ou de publication**. `main` `c95f1cde` : [CI 38632496153](https://github.com/takatakca/mimt/actions/runs/38632496153) réussie; CD Web et API `skipped`. Maintenir les drapeaux, secrets, serveur, sauvegardes, SHA servi, base MIMT indépendante et obligations 9-1-1 comme prérequis absolus.
