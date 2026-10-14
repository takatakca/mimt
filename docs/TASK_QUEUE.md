# MIMT — File de travail priorisée

Mise à jour : 2026-10-14. Marquer une tâche terminée seulement après preuve dans le dépôt ou l'environnement cible. **Continuer les tâches indépendantes lorsqu'un accès extérieur bloque une autre tâche.**

| Priorité | ID | Tâche | Critère observable | Bloqué par |
| --- | --- | --- | --- | --- |
| P0 | WEB-01 | Réconcilier site GitHub et production | **Audit FR effectué, code IA/comparateur enrichi, déploiement non destructif en place**; il reste parité anglaise + revue éditoriale/juridique des écarts avant approbation | Revue des pages EN, validation du propriétaire |
| P0 | WEB-02 | Achever collecte de leads de bout en bout | Migration `0004` appliquée, endpoint `/v1/public/leads` opérationnel avec erreur et limitation, formulaire `NEXT_PUBLIC_FORMS_ENDPOINT` configuré; tests POST réels contrôlés | Nouveau projet Supabase MIMT absent de la connexion actuelle; API hébergée non confirmée |
| P0 | WEB-03 | Vérifier hébergement mimt.ca et activer CD si approprié | Cible SSH vérifiée, fichier `.mimt-web-managed` placé, variables/secrets configurés, CI verte et `deploy-version.txt` = SHA publié | Accès au serveur et GitHub secrets |
| P0 | TEL-00 | Automatiser API après CI avec Coolify | `deploy-api.yml` activé seulement sur ressource API de `main`, SHA et /readyz vérifiés | Accès Coolify et secrets GitHub |
| P0 | TEL-01 | Environnement API et base MIMT | Coolify/API HTTPS, sauvegardes, migrations 0001–0004, `/readyz` réel DB up | Accès Coolify + Supabase séparé |
| P0 | TEL-02 | Valider téléphonie et obligations | Sous-compte Twilio payant, numéros/adresses 9-1-1, geo permissions CA/US, essais 933 chez opérateur, revue CRTC/CCTS/conditions | Fournisseur + responsable juridique |
| P0 | SECURITY-01 | Vérifier absence de secrets et RLS en environnement réel | Contrôle RLS, tests anonymes refusés, pas de clés service navigateur, logs sans PII, audit auth | Projet Supabase |
| P1 | TEL-03 | App mobile bêta vérifiée | Builds natifs signés, appels et SMS, notifications de vrais appareils, tests d'erreur et gestion de suspension | Twilio + Apple/Google |
| P1 | PBX-01 | Fonctionnalités Affaires réelles | IVR, groupes, horaires, extensions, admin tenant-scoped et journalisation validés avec 3 pilotes | Backend TEL-01, fournisseur |
| P1 | AI-01 | Réconcilier promesses IA et implémentation | Consentement distinct désactivé par défaut, plafond, fournisseurs conformes, signalement automatisé et retrait du consentement testés | Architecture/contrat fournisseur et Loi 25 |
| P1 | OPS-01 | Exploitation | Monitoring, alertes de dépenses, sauvegardes et restauration, rotation des clés, incident/runbook | Hébergement opérationnel |
| P2 | WEB-04 | QA approfondie | Parcours FR/EN, clavier, contraste, SEO, formulaire, mobile, régressions légales et E2E | Production/staging disponibles |
| P2 | LAUNCH-01 | Mise en service et validation finale | Vérification externe, légal, 9-1-1, CI, API, appels, transactions, preuves archivées | Tous les P0 et P1 |

## Réalisé côté dépôt

- 2026-10-14 : `WEB-BASE` — 28 routes FR/EN, validation de l'export et artéfact GitHub CI.
- 2026-10-14 : `WEB-DEPLOY-CODE` — Workflow SSH protégé par drapeau et marqueur ; **non activé**.
- 2026-10-14 : `WEB-02-CODE` — nouvelle route d'API, tests et migration, **pas encore de preuve de déploiement**.

## Prochain travail sans accès additionnel

1. Observer les résultats CI du SHA `629c4c7` et corriger toute erreur.
2. Corriger la documentation des formulaires et renseigner l'endpoint publiquement configurable en CI.
3. Exécuter une revue de parité site déployé ↔ site GitHub pour éviter l'écrasement des contenus existants.
4. Valider les flux sûrs et préparer le contrôle de release sans requérir de secrets.

**Ne jamais afficher « 100 % terminé » si les étapes de production et du 9-1-1 n'ont pas été vérifiées.**

- 2026-10-14 : `WEB-01-PARTIAL` — audit différentiel FR dans `docs/WEB_PARITY_AUDIT.md`, correctifs contenus IA/comparateur et protection du déploiement. **Pas d'approbation de la parité live, pas de publication.**
