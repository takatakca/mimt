# MIMT — Relève automatique d'agent

**Date du constat :** 2026-10-14.

## Relève la plus récente — WEB-01, 14 octobre 2026

- **Dernière tâche code terminée :** durcissement de `.github/workflows/deploy-web.yml` au commit `100e29e7a707024c3f9a80869958fd1677d78184`, parité IA au commit `53c71675de05e24b9f01b652f38d0e7b08396acf`, comparateur au commit `fda2694dacccb85a19a9fd24dcf0d0abf05522f3` et audit `docs/WEB_PARITY_AUDIT.md` au commit `756ada90bc8f0d6cb890b1ea504494d2878bb52a`. Le SHA HEAD continuera à évoluer lors de la mise à jour de cette relève : lire `main`.
- **Tâche actuelle :** terminer la validation de parité du contenu du site public dans les deux langues et la vérification d'intégration des services. Ne pas remplacer silencieusement la version en ligne.
- **CI confirmée :** le commit `100e29e` (sauvegarde avant publication) a réussi; les CI du code contenu `53c71675`, `fda2694d`, et de l'audit `756ada90` étaient en cours/en file au contrôle, vérifier les résultats GitHub Actions. Les workflows `Deploy MIMT Website` / `Deploy MIMT API` étaient `skipped`, non publiés.
- **Fichiers touchés :** `WORKLOG.md`, `apps/web/components/pages/AiPage.tsx`, `ComparePage.tsx`, `.github/workflows/deploy-web.yml`, `docs/WEB_PARITY_AUDIT.md`, les cinq fichiers de relève, `apps/web/README.md`.
- **Vérifications effectuées :** API GitHub de `main`, workflows (CI et CD), issues/PR ouverts (aucun); consultation web des pages `mimt.ca/`, `/ia/`, `/comparer/`, `/app-web/`; page anglaise non vérifiable via l'outil web. Aucun test SSH, Twilio, Supabase DB ou vrai 9-1-1 exécuté.
- **Problèmes ouverts :** le site live annonce un fournisseur IA et des plafonds qui ne sont pas validés dans GitHub. L'API `api.mimt.ca/healthz` et le hash `mimt.ca/deploy-version.txt` n'ont pas été vérifiés accessibles; pas de projet Supabase MIMT confirmé. `MIMT_WEB_PARITY_REVIEWED` doit être validée avant publication, et le marqueur distant doit contenir exactement `mimt.ca`.
- **Prochaine action exacte :** 1) vérifier la CI du dernier HEAD; 2) réconcilier la copie anglaise avec la production; 3) valider éditorialement `docs/WEB_PARITY_AUDIT.md` avant de régler les drapeaux CD; 4) si l'hébergement est disponible, vérifier la racine/SSH, le marqueur, la sauvegarde et le SHA après déploiement; sinon avancer WEB-02 (base et formulaire) sans toucher aux bases TAKATAK.

---

 **Dépôt :** `takatakca/mimt`. **Branche :** `main`. Source de vérité : GitHub, consulter `git rev-parse HEAD` ou l'API de la branche **avant toute écriture**. Une tâche de reprise **horaire** avait été configurée, puis désactivée ultérieurement. Ne pas présumer d'une reprise automatique actuellement active. Ce fichier n'exécute rien à lui seul et la fréquence horaire n'est pas un traitement permanent.

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
