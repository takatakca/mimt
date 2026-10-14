# MIMT — Relève automatique d'agent

**Date du constat :** 2026-10-14. **Dépôt :** `takatakca/mimt`. **Branche :** `main`. Source de vérité : GitHub, consulter `git rev-parse HEAD` ou l'API de la branche **avant toute écriture**. Aucune session en arrière-plan n'est déclenchée par ce fichier.

## Dernière tâche terminée

- Ajout code du collecteur privé des formulaires site : `POST /v1/public/leads`, validation, limite d'abus, repos mémoire/Postgres, tests, migration `0004_public_leads.sql`.
- **Dernier commit de code et documentation technique poussé :** `91b95e4b5acaa502991b1f42999492f248e52b84`. Les commits de relève ultérieurs font avancer `main`; relire la branche pour le SHA de tête.
- CI confirmées vertes : `629c4c7`, `fda368c`, `d4b168d`. CI sur `91b95e4` à consulter dans GitHub Actions (en file d'attente lors de cette mise à jour).

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
