# MIMT — Relève automatique d'agent

## Relève du 15 octobre 2026 — SECURITY-03B (tests SQL validés)

- **Dépôt / main initial :** `takatakca/mimt`, SHA `e5cbe7bfadfe68e9e5c4400f39b25ebf16071e25` ; CI initiale `38734604699` verte; aucune PR/issue ouverte, CD ignoré. Tâche WEB-02 déjà active par un autre agent, non touchée.
- **Dernière tâche code terminée :** limiteur métier partagé PostgreSQL (`OTP`, `SMS`, appels sortants ordinaires, leads), consommation atomique via transaction + verrou, fail-closed si stockage indisponible, clés HMAC-SHA256 avec secret `RATE_LIMIT_HMAC_KEY` séparé et purge uniquement des buckets expirés. Aucun changement au chemin prioritaire du 9-1-1.
- **Commit technique le plus récent :** `e5079982f4551f3cc6b05c15bf51d5292f3e8226`, [CI réussie #38775431115](https://github.com/takatakca/mimt/actions/runs/38775431115) avec tests PostgreSQL 16 isolé (concurrence 50 requêtes sur deux pools, recharge, RLS, panne de base, purge et protection de clés). Première CI SQL `38774365493` échouée sur délimiteur mal formé; correctif `8256196` puis CI `38774727808` réussie; HMAC `75652f3` puis CI `38775103461` réussie. Le présent commit documentaire fera avancer HEAD ; le revérifier au prochain passage.
- **Fichiers modifiés :** `WORKLOG.md`, `apps/api/src/fraud/postgresRateLimiter.ts`, `apps/api/src/bootstrap.ts`, `apps/api/src/config.ts`, `apps/api/src/jobs/pruneRateBuckets.ts`, `apps/api/test/postgres-rate-limiter.test.ts`, `apps/api/test/config.test.ts`, `apps/api/package.json`, `apps/api/.env.example`, `apps/api/README.md`, `.github/workflows/ci.yml`, `supabase/migrations/20261015173000_shared_rate_limit_buckets.sql`, `supabase/README.md` et les cinq fichiers de relève.
- **Vérifications exécutées :** API GitHub `branches/main`, historique/branches, PR/issues, workflows; GitHub Actions `pnpm typecheck`, `pnpm test` avec Postgres 16, export statique et vérification des liens ; interrogation en lecture de la connexion Supabase : **cinq projets existants, aucun MIMT identifié**. Pas de migration exécutée sur un serveur client.
- **Statut de déploiement :** dernier CD Web et API consultés `skipped`, aucun SHA en production démontré. Pas de configuration SSH/Coolify MIMT validée. Aucun appel 9-1-1 ni essai opérateur réel exécuté.
- **Blocages / limites :** absence de base dédiée MIMT; secret HMAC à placer dans le coffre-fort; migration `20261015173000` non appliquée en production; limite `@fastify/rate-limit` par IP toujours en mémoire par réplica, jobs/outbox non distribués. **Ne pas déclarer production multi-réplica prête.** Secrets Twilio/Stripe/IdP, conformité 9-1-1 et revues réglementaires toujours non vérifiés.
- **Tâche actuelle / prochaine action exacte :** vérifier HEAD et CI du commit documentaire; créer/identifier projet Supabase MIMT Canada dédié avec contrôle du propriétaire et coût, appliquer et auditer migrations `0001` à `0004` puis `20261015173000` dans un ordre contrôlé (ne pas appliquer dans TAKATAK); configurer `RATE_LIMIT_HMAC_KEY` et tester `readyz`; avancer un magasin central pour le rate-limit HTTP et la coordination outbox avant tout déploiement multi-réplica. Réaliser parité visuelle Web FR/EN et l'approbation 9-1-1 avant lancement.

---


## Session du 15 octobre 2026 — SECURITY-03A : limiteur mémoire borné

- **HEAD vérifié au démarrage :** `06817d3a53fa77f47549378e37861f8c8249bd69` sur `main`; CI [#38647530229](https://github.com/takatakca/mimt/actions/runs/38647530229) réussie, CD API et Web `skipped`. Aucun PR ni issue ouverts. WEB-02 (consentement) était `active` dans `WORKLOG.md`; aucun de ses fichiers n'a été touché.
- **Dernière tâche terminée / code poussé :** `SECURITY-03A` au SHA `4d0f81c6c32fa51712ff323cfe5af800a3c6d5ef`; `InMemoryRateLimiter` avec 50 000 entrées max, rejet des clés nouvelles si saturé, purge seulement de buckets inactifs et pleinement remplis, protections contre horloge reculant et règles invalides. Trois tests ajoutés au dossier fraude.
- **Vérifications :** revue GitHub du code et des utilisations des limiteurs, contrôle des chemins d'appels 9-1-1 ; GitHub Actions CI [#38734095766](https://github.com/takatakca/mimt/actions/runs/38734095766) **réussie** (typecheck, tests, build et export). Le 9-1-1 n'utilise pas les limites d'appels ordinaires avant son traitement dédié; aucune simulation d'appel réel réalisée.
- **Fichiers modifiés :** `WORKLOG.md`, `apps/api/src/fraud/rateLimiter.ts`, `apps/api/test/fraud.test.ts`, et les cinq documents de relève. Le commit documentaire de cette session fera avancer `main`; toujours relire le HEAD au début de la prochaine session.
- **État déploiement réel :** aucun nouveau SHA prouvé sur `mimt.ca` ou `api.mimt.ca`. Les dernières exécutions CD consultées sont `skipped`, aucun SSH/Coolify MIMT, projet Supabase MIMT ou essai Twilio validé.
- **Problèmes connus :** ce limiteur reste **par processus** et fail-closed sous forte pression de clés distinctes; plusieurs réplicas peuvent contourner globalement les plafonds. **Ne pas lancer plusieurs réplicas** avant d'installer et tester un magasin partagé atomique. Les formulaires WEB-02 sont pris en charge par un autre agent. Les autorisations réglementaires, 9-1-1, secrets, nom du responsable des données, contrats restent non vérifiés.
- **Accès nécessaires :** serveur/hôte SSH contrôlé et marqueur Web, espace backups, instance Coolify MIMT, projet Postgres MIMT dédié Canada avec migrations/RLS, secrets IdP/Twilio/Stripe et revue 9-1-1. Ne pas emprunter des bases TAKATAK.
- **Concurrence et branches :** branche antérieure `agent/security-rate-limiter-20261014` vérifiée après le commit ; elle contient une autre proposition de limitation mémoire (100 000 clés, balayage à 24 h). **Ne pas fusionner/cherry-picker cette branche automatiquement** : comparer d'abord au `main` testé (50 000 clés, TTL par règle), puis fermer/rebaser uniquement après revue. Aucune PR ouverte lors du contrôle.
- **Prochaine action exacte :** lire HEAD et CI, vérifier les modifications du propriétaire WEB-02, puis traiter `SECURITY-03B` en préparant un mécanisme de limitation atomique partagé (SQL/Redis dans un projet MIMT dédié) avec tests de concurrence sans activer la production; ou avancer la parité visuelle WEB-01 en environnement autorisé. Continuer la documentation et les contrôles avant CD.

---


## WEB-04 — reprise du 14 octobre 2026 (branche isolée)

- Base vérifiée : `main` `c95f1cde0e2253cfbedff13e0bd953039ffd663c`, CI [38632496153](https://github.com/takatakca/mimt/actions/runs/38632496153) réussie; CD Web et API ignorés (`skipped`). Aucun PR/issue ouvert au début de la reprise.
- Branche de travail : `agent/web04-link-attributes-20261014-3`; corrige les faux positifs `data-href`/`data-id` du vérificateur HTML, avec trois tests de régression. Tests locaux Node : **7/7**; `node --check` : réussi. **CI complète de la branche à vérifier**, aucune preuve de publication.
- Concurrence : `WEB-02` consentement actif dans `WORKLOG.md`; branches `agent/security-rate-limiter-20261014` et `agent/web-ai-claims-20261014` laissées intactes. Aucun changement API, DB, Twilio, 9-1-1 ou aux drapeaux de déploiement.
- Suite : ouvrir une PR vers `main`, lire sa CI et ses logs, corriger avant fusion; parité visuelle EN/staging et formulaire/API avec base MIMT dédiée toujours non validés. Ne pas activer `MIMT_WEB_PARITY_REVIEWED`.

## Relève vérifiée — 14 octobre 2026 (sécurité API et qualité Web)

- **Dépôt/branche :** `takatakca/mimt`, `main`. **Dernier commit technique poussé et testé :** `319e8794d715222213be3476eb57b75490c365ad` ; cette relève documentaire produit un nouveau SHA HEAD à lire dans GitHub.
- **Dernière tâche terminée :** audit de liens et sections de 28 pages statiques avec quatre tests Node; restriction de l'IP client transmise par le proxy aux CIDR explicites.
- **Tâche en cours / suivante :** terminer `WEB-01` (parité Web anglaise réellement publiée); puis `WEB-02` (base Supabase MIMT indépendante, API de formulaires), sans toucher à TAKATAK.
- **Fichiers modifiés :** `WORKLOG.md`, `apps/web/scripts/check-links.mjs`, `apps/web/scripts/check-links.test.mjs`, `.github/workflows/ci.yml`, `apps/api/src/config.ts`, `apps/api/src/app.ts`, `apps/api/test/config.test.ts`, `apps/api/test/proxy-trust.test.ts`, `apps/api/.env.example`, `apps/api/README.md` et cinq documents `docs/`.
- **Vérifications réellement exécutées :** inspection GitHub HEAD/PR/issues (aucun ouvert), `AGENTS.md`, `WORKLOG.md`, docs, workflows; `pnpm typecheck`, `pnpm test`, `pnpm --filter @mimt/web build`, `node apps/web/scripts/check-export.mjs`, `node --test apps/web/scripts/check-links.test.mjs`, `node apps/web/scripts/check-links.mjs` **par GitHub Actions**. Runs verts : [38625918929](https://github.com/takatakca/mimt/actions/runs/38625918929) au SHA `501839f9` et [38626239265](https://github.com/takatakca/mimt/actions/runs/38626239265) au SHA `319e8794`.
- **Déploiements réels :** `Deploy MIMT Website` et `Deploy MIMT API` sur `319e8794` sont **skipped**, pas de preuve de publication. Aucun appel 9-1-1 réel, aucune migration appliquée, aucun déploiement opérateur.
- **Erreurs/blocages :** le site EN en ligne n'a pas pu être récupéré; ancien texte public IA à valider; les accès SSH/marqueur, la racine mimt.ca, le projet Supabase MIMT et la ressource Coolify/Twilio ne sont pas établis. Le rate limiter d'API est en mémoire par instance.
- **Accès manquants :** variables GitHub CD Web et Coolify configurées sur les bonnes ressources; CIDR réel du reverse-proxy; projet DB MIMT Canada et migrations; Twilio, Stripe et validation juridique/CRTC. Ne pas exposer les secrets dans le dépôt ou chat.
- **Action exacte à la reprise :** vérifier HEAD `main` et sa CI, auditer `mimt.ca/en/`, `/en/ai/`, `/en/compare/`, `/en/web-app/` contre export GitHub en staging; si accès live impossible, avancer tests `SECURITY-03`. Ne régler les drapeaux de déploiement qu'avec validation d'hébergement, sauvegarde et preuve SHA.

---


**Date du constat :** 2026-10-14.

## Confirmation CI et relève — 14 octobre 2026

- **Dernier commit fonctionnel confirmé poussé :** `aaa8b62926722914359c7021d61e1ec09019bd22` (garde-fous bilingues de pré-lancement et références 9-1-1 dans `apps/web/scripts/check-export.mjs`).
- **CI de ce commit :** réussie, run [38624276434](https://github.com/takatakca/mimt/actions/runs/38624276434) ; comprend installation, build partagé, typecheck, tests, build site, export et vérification de 28 routes.
- **Dernier commit documentaire après confirmation CI :** lire le SHA actuel de `main` avant toute nouvelle écriture; ce document fait avancer la branche.
- **Déploiements :** `Deploy MIMT Website` et `Deploy MIMT API` restent `skipped` ; **aucune publication du nouveau SHA vérifiée**.
- **Blocage :** revue éditoriale/site EN et validation du chemin SSH, projet Supabase MIMT, secrets Coolify/Twilio, exigences réglementaires.
- **Tâche actuelle exacte :** terminer l'audit parité anglais en environnement accessible et faire signer les différences documentées dans `docs/WEB_PARITY_AUDIT.md`; ensuite vérifier les prérequis WEB-02 et WEB-03 sans contourner les drapeaux ni les essais 9-1-1.
- **Fichiers additionnels de cette session :** `apps/web/scripts/check-export.mjs`; six documents `docs/` et `WORKLOG.md` mis à jour. Commande CI ajoutée : `node apps/web/scripts/check-export.mjs` (exécutée avec succès dans GitHub Actions).

---

## Relève précédente — WEB-01, 14 octobre 2026

- **Dernière tâche code terminée :** durcissement de `.github/workflows/deploy-web.yml` au commit `100e29e7a707024c3f9a80869958fd1677d78184`, parité IA au commit `53c71675de05e24b9f01b652f38d0e7b08396acf`, comparateur au commit `fda2694dacccb85a19a9fd24dcf0d0abf05522f3` et audit `docs/WEB_PARITY_AUDIT.md` au commit `756ada90bc8f0d6cb890b1ea504494d2878bb52a`. Le SHA HEAD continuera à évoluer lors de la mise à jour de cette relève : lire `main`.
- **Tâche actuelle :** terminer la validation de parité du contenu du site public dans les deux langues et la vérification d'intégration des services. Ne pas remplacer silencieusement la version en ligne.
- **CI confirmée :** le commit `100e29e` (sauvegarde avant publication) a réussi; les CI du code contenu `53c71675`, `fda2694d`, et de l'audit `756ada90` étaient en cours/en file au contrôle, vérifier les résultats GitHub Actions. Les workflows `Deploy MIMT Website` / `Deploy MIMT API` étaient `skipped`, non publiés.
- **Fichiers touchés :** `WORKLOG.md`, `apps/web/components/pages/AiPage.tsx`, `ComparePage.tsx`, `.github/workflows/deploy-web.yml`, `docs/WEB_PARITY_AUDIT.md`, les cinq fichiers de relève, `apps/web/README.md`.
- **Vérifications effectuées :** API GitHub de `main`, workflows (CI et CD), issues/PR ouverts (aucun); consultation web des pages `mimt.ca/`, `/ia/`, `/comparer/`, `/app-web/`; page anglaise non vérifiable via l'outil web. Aucun test SSH, Twilio, Supabase DB ou vrai 9-1-1 exécuté.
- **Problèmes ouverts :** le site live annonce un fournisseur IA et des plafonds qui ne sont pas validés dans GitHub. L'API `api.mimt.ca/healthz` et le hash `mimt.ca/deploy-version.txt` n'ont pas été vérifiés accessibles; pas de projet Supabase MIMT confirmé. `MIMT_WEB_PARITY_REVIEWED` doit être validée avant publication, et le marqueur distant doit contenir exactement `mimt.ca`.
- **Prochaine action exacte :** 1) vérifier la CI du dernier HEAD; 2) réconcilier la copie anglaise avec la production; 3) valider éditorialement `docs/WEB_PARITY_AUDIT.md` avant de régler les drapeaux CD; 4) si l'hébergement est disponible, vérifier la racine/SSH, le marqueur, la sauvegarde et le SHA après déploiement; sinon avancer WEB-02 (base et formulaire) sans toucher aux bases TAKATAK.

---

 **Dépôt :** `takatakca/mimt`. **Branche :** `main`. Source de vérité : GitHub, consulter `git rev-parse HEAD` ou l'API de la branche **avant toute écriture**. La tâche horaire **« MIMT — Reprise GitHub »** a été **réactivée** le 14 octobre 2026, après reprise confirmée des écritures GitHub. Elle effectue au plus une passe par heure selon les autorisations; elle ne constitue pas un processus permanent et ne prouve aucun déploiement. Ce fichier n'exécute rien à lui seul et la fréquence horaire n'est pas un traitement permanent.

## Dernière tâche terminée

- Ajout code du collecteur privé des formulaires site : `POST /v1/public/leads`, validation, limite d'abus, repos mémoire/Postgres, tests, migration `0004_public_leads.sql`.
- **Dernier commit de code et documentation technique poussé :** `91b95e4b5acaa502991b1f42999492f248e52b84`. Les commits de relève ultérieurs font avancer `main`; relire la branche pour le SHA de tête.
- CI confirmées vertes : `629c4c7`, `fda368c`, `d4b168d`, `91b95e4`. CI du commit de relève `d703251` en attente lors de cette mise à jour. Les workflows API/Web CD sont `skipped`.

## Tâche en cours

- Vérifier la CI des derniers changements GitHub, puis les preuves de déploiement.
- Les 5 documents obligatoires sont créés; les mettre à jour à chaque reprise.
- Vérifier les différences entre `mimt.ca` en ligne et `apps/web` avant toute publication destructive.

## Fichiers modifiés dans cette reprise

- `WORKLOG.md`.
- `apps/api/src/app.ts`, `apps/api/src/routes/publicLeads.ts`, `apps/api/test/public-leads.test.ts`.
- `apps/api/src/repo/types.ts`, `apps/api/src/repo/memory.ts`, `apps/api/src/repo/postgres.ts`.
- `supabase/migrations/0004_public_leads.sql`.
- `docs/PROJECT_STATUS.md`, `docs/TASK_QUEUE.md`, `docs/AGENT_HANDOFF.md`, `docs/DEPLOYMENT.md`, `docs/DECISIONS.md`.

## Vérifications réellement exécutées

- GitHub : lecture `AGENTS.md`, `WORKLOG.md`, arborescence et dernier SHA de `main`.
- GitHub : 0 PR ouvert, 0 issue ouverte (constat de la reprise).
- GitHub Actions : CI verte antérieure; déploiements site `skipped`.
- Inspection du site public `https://mimt.ca/`, `/ia/`, `/app-web/` ; présence vérifiée des pages, **pas la version SHA**.
- Détection publique : `https://app.mimt.ca/` répond, mais les appels/navigation restent non vérifiés; `https://api.mimt.ca/healthz` non confirmé.
- Connexion Supabase : `list_projects` retourne TAKATAK STAGING, FESTI ICE, TAKATAK User Official Dashboard V1, takatak-foodhub et ALKAO, **aucun projet MIMT**. Ne pas appliquer de migration MIMT dans ces autres projets.
- Aucun `DATABASE_URL`, credential Twilio, clé SSH, projet Supabase ou accès Coolify n'a été emprunté ni inventé.

## Problèmes et blocages connus

1. Formulaires : migration non appliquée et API non déployée; site bascule actuellement vers courriel si `NEXT_PUBLIC_FORMS_ENDPOINT` est absent.
2. Site : hébergeur et racine documentaires non confirmés; flux GitHub SSH désactivé, marqueur serveur et secrets manquants.
3. Site en ligne : certaines promesses et mentions de fournisseur IA semblent différer du code actuellement versionné; ne pas les remplacer silencieusement.
4. Opérateur Twilio, réglage 9-1-1, conformité et stores : pas de tests/validation réels.
5. Aucun nom de détenteur de données/personne chargée de la vie privée confirmé dans la notice légale.

## Statut réel du déploiement

- `mimt.ca` : accessible publiquement, mais aucune preuve que le SHA GitHub récent y soit publié.
- `Deploy MIMT Website` : **skipped**, `MIMT_WEB_DEPLOY_ENABLED` non configuré.
- `Deploy MIMT API` : **skipped**, `MIMT_API_DEPLOY_ENABLED` non configuré (et aucun Coolify MIMT validé).
- `api.mimt.ca` : disponibilité non confirmée ; nouvelle route de leads non disponible publiquement de façon vérifiée.
- Build local : pas réalisé (environnement local sans accès au clone GitHub); utiliser CI distante pour les tests.

## Accès nécessaires, jamais dans le chat

- GitHub Actions : variables `MIMT_WEB_*`, secrets SSH dédiés et empreinte known_hosts.
- Hébergeur effectif : racine du domaine mimt.ca, port SSH, compte et marqueur.
- Coolify/API : hostname, instance Docker et variables de production privées.
- Supabase MIMT : projet Canadien, migration 0004, sauvegardes, RLS.
- Twilio, Stripe, TAKATAK IdP, app stores ; validations réglementaires.

## Prochaine action exacte

1. **Lire ce fichier, `AGENTS.md`, `WORKLOG.md`, `docs/TASK_QUEUE.md`.**
2. Lire le vrai SHA `main` et l'exécution GitHub CI associée à `91b95e4` (ou commit ultérieur).
3. En cas d'échec, examiner le job et son log, corriger au plus petit diff, relancer CI et consigner le SHA.
4. Sinon continuer `WEB-02` : identifier/créer un projet Supabase MIMT **séparé et autorisé**, appliquer les migrations, déployer l'API via le CD Coolify, vérifier un vrai POST et la RLS, puis activer la variable `MIMT_WEB_FORMS_ENDPOINT`. Sans accès, poursuivre `WEB-01` (parité du site public).
5. **Ne pas** activer la publication destructive ou annoncer le télécom lancé sans vérification de la cible et des exigences 9-1-1.
