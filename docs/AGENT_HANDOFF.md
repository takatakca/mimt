# MIMT — Relève automatique d'agent

**Date du constat :** 2026-10-14. **Dépôt :** `takatakca/mimt`. **Branche :** `main`. Source de vérité : GitHub, consulter `git rev-parse HEAD` ou l'API de la branche **avant toute écriture**. Aucune session en arrière-plan n'est déclenchée par ce fichier.

## Dernière tâche terminée

- Ajout code du collecteur privé des formulaires site : `POST /v1/public/leads`, validation, limite d'abus, repos mémoire/Postgres, tests, migration `0004_public_leads.sql`.
- **Dernier commit de fonctionnalité confirmé poussé :** `629c4c7e3173e7424f50517e4ac0b364f9494aea`. Le SHA de la branche `main` avancera à chaque mise à jour documentaire; consulter GitHub pour la tête actuelle.
- CI Web précédente verte : `b81d71d09025ce4731a11641e8aabddac21217c7` ; le statut de la nouvelle série est à reconsulter dans Actions.

## Tâche en cours

- Vérifier et corriger la CI du collecteur de leads et de l'export.
- Produire/maintenir les 5 documents obligatoires et la procédure de déploiement.
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
2. Lire le vrai SHA `main` et l'exécution GitHub CI associée à `629c4c7` (ou commit ultérieur).
3. En cas d'échec, examiner le job et son log, corriger au plus petit diff, relancer CI et consigner le SHA.
4. Sinon continuer `WEB-02` : endpoint public configurable, validation réelle de l'envoi, documentation de migration et protection des PII.
5. **Ne pas** activer la publication destructive ou annoncer le télécom lancé sans vérification de la cible et des exigences 9-1-1.
