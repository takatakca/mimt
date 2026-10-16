# MIMT — État vérifié du projet

Date : 2026-10-14 · Référentiel : https://github.com/takatakca/mimt · branche de publication : `main`.

## Règle d'état

Un commit dans GitHub n'est **pas** une preuve de déploiement. Les états « code implémenté », « CI vérifiée » et « service confirmé en production » restent distincts. Pour chaque changement, consulter GitHub Actions et les URL du service.

| Domaine | Code GitHub | Vérification actuelle | État public |
| --- | --- | --- | --- |
| Site public FR/EN | 28 routes, SEO, accessibilité, pages IA/comparaison/App Web | CI de l'export statique ; CI verte au SHA `b81d71d` puis aux changements antérieurs | `https://mimt.ca/` accessible ; **sa version exacte et son hébergeur restent non vérifiés** |
| Formulaires | Mailto de secours ; `POST /v1/public/leads` et table `public_leads` ajoutés au SHA `629c4c7` | Tests de route ajoutés ; migration à exécuter dans la base MIMT | Collecte persistante **non déployée / non confirmée** |
| API télécom | Fastify, TAKATAK OIDC, Twilio voix/SMS, facturation, 9-1-1, anti-fraude | CI existante, mais pas de test opérateur/transporteur réel | `https://api.mimt.ca/healthz` non confirmé |
| Application mobile | Expo, VoIP, messages, adresse 9-1-1, achats | Tests unitaires; builds/signatures magasins non attestés | Aucune disponibilité commerciale validée |
| App Web | Page de présentation disponible; implémentation du softphone à confirmer | `https://app.mimt.ca/` répond sur le Web mais les parcours d'appel ne sont pas vérifiés | **Ne pas annoncer comme opérationnel** |
| Base de données | Migrations `0001` à `0004`; RLS, séparation des rôles | La connexion Supabase interrogée le 2026-10-14 liste cinq projets, **aucun nommé MIMT**; aucune migration MIMT appliquée ici | À configurer |
| Déploiement site | `Deploy MIMT Website`, synchronisation SSH sur CI validée | Dernières exécutions **skipped**, également pour le nouveau CD Coolify API ; variables et marqueur nécessaires | Automatisation non activée |
| Juridique/CRTC | Textes préparatoires et dossier de recherche | Revue d'avocat et tests d'urgence fournisseur non confirmés | Blocage de lancement télécom |

## Frontières et sécurité

- GROUPE TAKATAK gère l'identité et les habilitations ; MIMT conserve et protège ses données télécom et les événements par domaine et locataire.
- Aucun service public payant ou appel vers le RTPC n'est déclaré lancé.
- Le 9-1-1 ne doit jamais être filtré par les plafonds ou la suspension. Les essais d'urgence se font avec la méthode approuvée par le fournisseur, **pas en composant 911 pour tester**.
- Les données de formulaires sont privées ; la case marketing n'est qu'une demande de consentement à confirmer, jamais un abonnement vérifié.
- Les informations du site actuellement public ne doivent pas être écrasées sans revue différentielle. Certaines mentions de fonctions IA, plafonds et fonctionnalités y sont plus détaillées que les pages GitHub récemment recréées.

## Critère de clôture

Pour passer à « prêt », confirmer **ensemble** : CI verte sur le SHA livré, migrations effectivement appliquées, services intégrés opérationnels, revue juridique, preuve du domaine et du hash publié, vérifications 9-1-1/opérateur, secrets gérés hors code, suivi d'incidents et procédure de retour arrière.

Voir [TASK_QUEUE](TASK_QUEUE.md), [DEPLOYMENT](DEPLOYMENT.md), [AGENT_HANDOFF](AGENT_HANDOFF.md) et [DECISIONS](DECISIONS.md).

## Orchestration

Reprise externe programmée chaque heure le 2026-10-14, intitulée « MIMT — Reprise GitHub », pour relire la relève et poursuivre les tâches autorisées. Ce mécanisme ne prouve ni progression continue, ni réussite automatique d'une publication. Les garde-fous CI, base séparée et 9-1-1 restent obligatoires.

## Audit de parité de cette session (2026-10-14)

- Voir [WEB_PARITY_AUDIT.md](WEB_PARITY_AUDIT.md) : écarts observés entre le contenu vivant de `mimt.ca` et le dépôt `apps/web`.
- Les contenus IA et comparateur ont été améliorés, mais aucune caractéristique commerciale encore non contractuelle (Claude/Anthropic, plafonds IA, durée précise) n'a été déclarée acquise dans GitHub.
- Le déploiement Web exige maintenant `MIMT_WEB_DEPLOY_ENABLED=true` **et** `MIMT_WEB_PARITY_REVIEWED=true`, marqueur distant contenant `mimt.ca`, sauvegarde préalable hors répertoire public et synchronisation **sans suppression**.
- Dernier succès CI confirmé lors de la modification : `100e29e7`. Les nouvelles CI doivent être revérifiées. **Aucun déploiement production exécuté** ; aucun accès SSH/Supabase MIMT confirmé.
- L'automatisation horaire « MIMT — Reprise GitHub » a été réactivée le 14 octobre 2026 avec obligation de relire les fichiers de relève, vérifier les protections et ne notifier qu'un changement réel. La relève GitHub reste la source de continuité.

## Dernière vérification CI — 14 octobre 2026

- Commit fonctionnel `aaa8b62926722914359c7021d61e1ec09019bd22` : **CI réussie** ([run 38624276434](https://github.com/takatakca/mimt/actions/runs/38624276434)); vérification TypeScript, suite de tests et export Next.js, y compris messages de pré-lancement et liens 9-1-1 sur les routes bilingues critiques.
- Aucun secret d'API, fournisseur IA, prix IA plafonné ou contrat d'hébergement n'a été ajouté dans ce travail. Les fonctionnalités IA ne sont pas déclarées lancées.
- **Statut production inchangé :** workflow site et API `skipped`; `mimt.ca/deploy-version.txt` ne confirme pas le SHA et `api.mimt.ca` reste non vérifié. Le projet demeure en construction.

## Reprise supplémentaire — 14 octobre 2026

**Dernier commit technique testé :** `319e8794d715222213be3476eb57b75490c365ad`, [CI réussie 38626239265](https://github.com/takatakca/mimt/actions/runs/38626239265). `main` sera avancée par cette mise à jour documentaire : vérifier son SHA actuel dans GitHub à la prochaine reprise.

- Site statique : audit systématique des liens internes et fragments sur toutes les pages exportées; tests du vérificateur dans GitHub Actions, [CI réussie 38625918929](https://github.com/takatakca/mimt/actions/runs/38625918929).
- API : suppression de `trustProxy: true`; les en-têtes IP transmis par un proxy sont ignorés par défaut et acceptés seulement depuis les CIDR explicitement autorisés, avec contrôles de configuration et tests.
- Déploiement : `Deploy MIMT Website` et `Deploy MIMT API` ont tous deux été **skipped** pour `319e8794` ; aucun SHA en production ne peut être confirmé. Les secrets du vrai hébergeur, Coolify et la base MIMT restent non vérifiés.
- Parité EN : tentative d'ouverture de `/en/`, `/en/ai/`, `/en/compare/`, `/en/web-app/` via l'accès web; pages non récupérées, **pas de déclaration de parité live**. L'export EN GitHub passe les contrôles internes, ce qui n'est pas un contrôle live.

## WEB-04 — attributs HTML (branche isolée, 2026-10-14)

Correctif proposé : `data-href` n'est pas un lien, `data-id` n'est pas une cible de fragment. Trois nouveaux tests, suite Node locale **7/7**; CI complète de branche en attente. Base `main` `c95f1cde`, [CI 38632496153](https://github.com/takatakca/mimt/actions/runs/38632496153) réussie; CD Web/API `skipped`. Aucun nouveau déploiement ni migration; parité visuelle EN et formulaire/API avec base MIMT séparée toujours ouverts.

## Contrôle du 15 octobre 2026 — SECURITY-03A

- `main` démarrait à `06817d3a53fa77f47549378e37861f8c8249bd69`, [CI #38647530229](https://github.com/takatakca/mimt/actions/runs/38647530229) **réussie**. Les workflows de déploiement API et Web étaient `skipped`.
- Incrément `SECURITY-03A` : limiteur token-bucket mémoire borné à **50 000 clés actives** (déni par défaut lorsque plein plutôt qu'éviction des clés actives), nettoyage des clés inactives, horloge décroissante et règles invalides contrôlées. Trois nouveaux tests dans `apps/api/test/fraud.test.ts`.
- Code poussé au SHA `4d0f81c6c32fa51712ff323cfe5af800a3c6d5ef`, [CI #38734095766](https://github.com/takatakca/mimt/actions/runs/38734095766) **réussie**. La rédaction de cette relève ajoute un commit documentaire sur main, dont la CI doit être consultée après push.
- **Non résolu** : plafonds toujours indépendants entre les instances. La production multi-réplica n'est **pas autorisée** avant limitation distribuée et essais concurrentiels. Les appels d'urgence 9-1-1 conservent leur exception explicite; aucun test fournisseur réel réalisé.
- **Production** : aucune preuve de SHA servi ni de déploiement API, Web, base ou téléphonie. Blocages antérieurs inchangés.

## Mise à jour du 15 octobre 2026 — compteurs partagés

- **SECURITY-03B codé et vérifié** : `PostgresRateLimiter` transactionnel (verrou de ligne), limites partagées pour OTP/SMS/appels non urgents/formulaires, refus en cas de panne DB, HMAC-SHA256 avec clé dédiée, migration SQL de table privée + RLS et script de purge. CI PostgreSQL 16 réelle [#38775431115](https://github.com/takatakca/mimt/actions/runs/38775431115) verte pour le commit technique `e5079982f4551f3cc6b05c15bf51d5292f3e8226`.
- **Incident CI corrigé :** premier test de migration échoué (`38774365493`) à cause d'un délimiteur SQL `DO` mal formé; réparé et revérifié par `38774727808`. Validation du HMAC `38775103461` : réussie.
- **Base en ligne :** liste actuelle Supabase interrogée : aucun projet nommé MIMT parmi les cinq accessibles. **Aucune migration appliquée** à un projet client. Le besoin de créer/identifier MIMT dédié Canada demeure.
- **Risque résiduel :** le plugin Fastify de quota global IP conserve un état par processus; les jobs/outbox ne sont pas prêts pour plusieurs replicas. La migration est un prérequis du nouveau binaire API, faute de quoi les requêtes limitées seront refusées. Aucun 9-1-1 réel testé.
- **Déploiements :** workflows SSH Web et API Coolify encore `skipped`. Le site et l'API publics ne peuvent pas être déclarés synchronisés au SHA GitHub.

## Statut de santé amélioré — 15 octobre 2026

- `GET /readyz` ne se contente plus de `SELECT 1` : la connexion Postgres doit exposer les **24 tables de toutes les migrations MIMT**, chacune avec `relrowsecurity` actif, faute de quoi la disponibilité est refusée. Commit code `5c30e0351889ae8ff8464e9b0480808e200a9d70`, [CI #38776170530](https://github.com/takatakca/mimt/actions/runs/38776170530) réussie, incluant tests de métadonnées RLS sur Postgres 16 CI.
- **Limites confirmées :** ces tests utilisent des tables de structure factices dans une base CI isolée et ne remplacent pas des migrations réelles, le contrôle des politiques `anon`/`authenticated` ou le test de `readyz` en production. Les services publics de health/version n'étaient pas récupérables par l'outil Web.
- **Production :** CD encore `skipped`; 5 projets Supabase accessibles, aucun MIMT identifié; lancement télécom et conformité 9-1-1 toujours en attente.

## Session du 15 octobre 2026 — partage HTTP et fiabilité des webhooks TAKATAK

- `SECURITY-03C` : limite HTTP global par IP de 300 requêtes/60 s via `deps.rateLimiter`; partagé automatiquement entre les processus quand PostgreSQL MIMT est configuré. Les endpoints de santé, chemins de configuration E911 et callbacks fournisseurs signés sont exemptés. La liste des URL de callbacks est exacte, plus le préfixe générique `/webhooks/`. Les quotas supplémentaires `@fastify/rate-limit` par route restent locaux. CI [`38791371698`](https://github.com/takatakca/mimt/actions/runs/38791371698) verte, SHA `356e5312`.
- `OPS-01` : les événements TAKATAK sont réclamés via un UPDATE SQL atomique avec `FOR UPDATE SKIP LOCKED`, un bail de 120 s et jusqu'à cinq événements par lot. Tests PostgreSQL isolés de concurrence, abandon et envoi par deux travailleurs; CI [`38792255274`](https://github.com/takatakca/mimt/actions/runs/38792255274) verte au SHA `35b693ac`. Pas de migration requise : réutilisation de `next_attempt_at`. Garantie *at-least-once*; TAKATAK doit dédupliquer le champ `id`.
- Les déploiements **Web et API** ont été `skipped` pour le commit de code `35b693ac`. Vérification Supabase : cinq projets existants, aucun projet MIMT identifiable. Aucun SHA de production, connexion de téléphonie ni 9-1-1 réel vérifié; les critères de lancement ne sont pas atteints.

## Session du 16 octobre 2026 — maintenance du limiteur PostgreSQL

- `OPS-02` : purge des clés HMAC expirées en lots limités, verrouillage concurrent `FOR UPDATE SKIP LOCKED`, protections contre la suppression des quotas encore actifs, exécution au démarrage et toutes les 5 min dans l'API (10 lots × 1 000 max/passage). Aucun nettoyage dans les routes d'urgence.
- Fichiers source `apps/api/src/fraud/postgresRateLimiter.ts`, `apps/api/src/server.ts` ; tests SQL PostgreSQL isolé `apps/api/test/postgres-rate-limiter.test.ts`. CI de la première version [#38882774176](https://github.com/takatakca/mimt/actions/runs/38882774176) réussie ; vérifier [#38882978609](https://github.com/takatakca/mimt/actions/runs/38882978609) pour l'optimisation `9305b270`.
- **Production inchangée :** CD API/Web encore `skipped`. API, base et SHA actifs non confirmés; aucune base MIMT distincte dans la liste de cinq projets Supabase connectés. Pas de validation d'appel 9-1-1 ni de lancement télécom.

**Confirmation complémentaire — 16 octobre 2026 :** CI du code optimisé `9305b270` : [#38882978609](https://github.com/takatakca/mimt/actions/runs/38882978609) **réussie**. CI de la relève `16aee1b5` : [#38883162397](https://github.com/takatakca/mimt/actions/runs/38883162397) **réussie**. La tâche horaire autorisée « MIMT — Reprise GitHub » a été réactivée, sans permission supplémentaire de déployer. Cette confirmation produit un nouveau commit documentaire, dont il faut revérifier le SHA/CI après push. API/Web toujours `skipped`; aucune mise en production confirmée.

## 16 octobre 2026 — sécurité du traitement d'outbox (OPS-03)

- GitHub `main`, correctif `2f4e8c5a38769151ffea1f618d76adba20a35505`; CI [#38942191701](https://github.com/takatakca/mimt/actions/runs/38942191701) réussie (tests PostgreSQL 16 isolés et build Web).
- Les acquittements `takatak_outbox` sont désormais conditionnels au **bail effectivement détenu** : un ancien processus dont le bail a été repris ne peut plus écraser un statut de livraison ou un délai de nouvelle tentative. Les implémentations Postgres et mémoire et le contrat de Repository sont mis à jour; aucun changement de schéma requis.
- L'intégration réceptrice TAKATAK doit malgré tout dédupliquer les événements via l'ID stable; garanties *at-least-once* uniquement. **Aucun déploiement confirmé** : les workflows Web et API de ce commit ont été `skipped`.
