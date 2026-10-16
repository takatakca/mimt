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

## Gate anti-abus — 15 octobre 2026

La nouvelle implémentation `InMemoryRateLimiter` impose un plafond de 50 000 clés actives par processus et refuse les clés supplémentaires lorsque cette capacité est atteinte, sans remettre à zéro les limites existantes. La CI `38734095766` est réussie sur le commit `4d0f81c6`.

**Important :** les limites demeurent indépendantes entre les réplicas Fastify. Ne pas configurer la production MIMT en plusieurs réplicas, autoscaling ou plusieurs instances d'API tant qu'un limiter atomique **partagé** n'est pas implémenté, testé sous concurrence et surveillé. Une saturation peut refuser les demandes non urgentes; monitorer les taux 429 et les volumes de clés distinctes. Ce contrôle ne doit jamais être appelé dans le chemin prioritaire du 9-1-1.

Les gates Web `MIMT_WEB_DEPLOY_ENABLED` et `MIMT_WEB_PARITY_REVIEWED` ainsi que la ressource API `MIMT_API_DEPLOY_ENABLED` demeurent fermés en l'absence d'infrastructure MIMT confirmée, d'approbations et de preuve SHA live.

## Déploiement conditionnel de SECURITY-03B — 15 octobre 2026

**Aucun déploiement MIMT confirmé.** Le code `PostgresRateLimiter` utilise maintenant la connexion directe au projet Postgres MIMT. À toute première activation de l'API mise à jour, **appliquer au préalable** `supabase/migrations/20261015173000_shared_rate_limit_buckets.sql` dans la base MIMT dédiée, en plus des migrations `0001`–`0004` et du contrôle de RLS. Cette migration n'a été testée que sur un conteneur PostgreSQL 16 isolé dans GitHub Actions.

**Secret nécessaire :** `RATE_LIMIT_HMAC_KEY` = 32 octets aléatoires en base64 (générer dans le coffre-fort : `openssl rand -base64 32`). Le serveur refuse la configuration avec `DATABASE_URL` si ce secret est absent/invalide. Garder la même valeur sur tous les réplicas; sa rotation réinitialise les clés de quota et nécessite une procédure de migration. Ne l'ajouter jamais dans un fichier public ou un message.

**Tests exécutés :** `pnpm test` contre PostgreSQL 16 dans GitHub Actions, avec `MIMT_RATE_LIMIT_TEST_DATABASE_URL` réservé au conteneur CI; succès du commit `e5079982` via `38775431115`. Vérification DB live, restauration et contrôle de charge réelle : non exécutés.

**Entretien :** après configuration de l'API réelle et autorisation des tâches planifiées Coolify, exécuter par exemple une fois par jour `node apps/api/dist/jobs/pruneRateBuckets.js` (ou `pnpm --filter @mimt/api job:prune-rate-limits` depuis le dépôt avec build). La purge ne supprime que les clés inactives depuis leur fenêtre entière plus une heure; ne pas ouvrir d'accès public à la table.

**Interdiction d'autoscaling :** les limites métier sont partagées, mais le plugin HTTP `@fastify/rate-limit` et l'outbox/pollers restent locaux. Ne pas mettre plusieurs réplicas en production sans tests et synchronisation globale. Le 9-1-1 est hors quotas anti-abus ordinaires et reste une obligation de vérification opérateur.

## Protection `/readyz` avant bascule (15 octobre 2026)

L'API liée à PostgreSQL n'indique désormais `db: up` qu'avec **24 tables MIMT** reconnues et la RLS activée pour chacune; absence de migration ou RLS désactivée => réponse `503`. Cela couvre `0001`–`0004` et `20261015173000_shared_rate_limit_buckets.sql`. La CI [38776170530](https://github.com/takatakca/mimt/actions/runs/38776170530) prouve le comportement sur une base **isolée** mais n'exécute pas les migrations commerciales. Vérifier également les vraies politiques RLS au moyen des rôles d'essai avant d'activer un hébergement réel; `readyz` seul ne démontre pas leur correction.

Les URL publiques `https://mimt.ca/deploy-version.txt`, `https://api.mimt.ca/healthz` et `https://api.mimt.ca/readyz` n'étaient pas récupérables dans la vérification web de cette session. Ne jamais présumer que le SHA GitHub est déployé.

## Contrôles supplémentaires API — 15 octobre 2026

**Global HTTP :** `SECURITY-03C` appelle le magasin de token-buckets `deps.rateLimiter` pour un quota partagé de 300 requêtes/minute/IP lorsque `DATABASE_URL` et `RATE_LIMIT_HMAC_KEY` sont réellement configurés. Les routes de santé, les parcours `/v1/e911/` et les callbacks fournisseurs **connus et signés** sont exemptés du quota global; la vérification de signature du callback reste obligatoire. Les limites Fastify spécifiques à certaines routes restent locales (à faire évoluer si nécessaire). GitHub CI `38791371698` réussie, pas de publication.

**Outbox TAKATAK :** les travailleurs réclament au maximum cinq événements à la fois en écrivant atomiquement une échéance `next_attempt_at` de +120 s, grâce au verrouillage `FOR UPDATE SKIP LOCKED`. L'envoi utilise des IDs stables et une temporisation HTTP de 10 s/événement. Après crash, les événements redeviennent admissibles lorsque le bail expire. Cela évite les prises concurrentes ordinaires, mais **n'offre pas l'exactement-une-fois** ; le consommateur TAKATAK doit dédupliquer les effets métiers sur l'ID d'événement. CI Postgres `38792255274` verte. **Aucune migration additionnelle** pour ce mécanisme, car `next_attempt_at` existait déjà.

Ne pas activer Coolify ni le CD sans schéma MIMT en place et test des webhooks de bout en bout. Aucun projet Supabase MIMT connecté n'a été identifié. Ne pas utiliser les projets des autres produits.

## Maintenance intégrée de la base MIMT — 16 octobre 2026

L'API exécute automatiquement le nettoyage de `fraud_rate_buckets` après le démarrage HTTPS et ensuite toutes les **5 minutes**. Elle supprime uniquement les lignes HMAC dont l'expiration dépasse plus d'une heure, par transaction plafonnée à **1 000** lignes, et par passage plafonné à **10** transactions; les sélections utilisent `FOR UPDATE SKIP LOCKED` pour éviter de bloquer la prise de jetons en cours ou les autres réplicas. Le nettoyage ne s'exécute jamais dans les requêtes d'urgence. Les incidents DB sont journalisés sans données personnelles ni SQL brut; aucun fallback qui accorde automatiquement un quota.
- Test CI vérifié : `38882774176` (première version). Version optimisée `9305b270` : run `38882978609`, état final à confirmer.
- Vérifier métriques de taille de `fraud_rate_buckets`, volumes de refus HTTP 429, coût de nettoyage et sauvegardes après création autorisée d'une base MIMT indépendante; ne pas effectuer de SQL sur TAKATAK STAGING ou les autres projets.
- Les déploiements GitHub vers Web et Coolify restent inactifs; configuration de l'hébergeur, des secrets et validation légale/9-1-1 requises.

**Confirmation complémentaire — 16 octobre 2026 :** CI du code optimisé `9305b270` : [#38882978609](https://github.com/takatakca/mimt/actions/runs/38882978609) **réussie**. CI de la relève `16aee1b5` : [#38883162397](https://github.com/takatakca/mimt/actions/runs/38883162397) **réussie**. La tâche horaire autorisée « MIMT — Reprise GitHub » a été réactivée, sans permission supplémentaire de déployer. Cette confirmation produit un nouveau commit documentaire, dont il faut revérifier le SHA/CI après push. API/Web toujours `skipped`; aucune mise en production confirmée.
