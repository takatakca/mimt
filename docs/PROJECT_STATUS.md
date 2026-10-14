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
