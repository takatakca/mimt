# WEB-01 — Audit de parité du site public MIMT

Date : 2026-10-14 · Source publique consultée : https://mimt.ca/ · Comparaison avec le code source `main` au commit `fda2694dacccb85a19a9fd24dcf0d0abf05522f3`.

**Statut : audit technique exécuté; validation éditoriale et contractuelle encore requise avant un premier remplacement du site public.** Aucun déploiement ni preuve de parité parfaite. La copie `apps/web` est en français et en anglais; la comparaison de contenu en ligne a pu être menée sur les pages françaises et non de manière exhaustive sur toutes les pages anglaises.

| Domaine | Contenu visible le 14 octobre 2026 | Réconciliation GitHub | Décision / suite |
| --- | --- | --- | --- |
| Accueil `/` | 3 forfaits Mobile, enjeux du 9-1-1, IA, App Web, liste d'attente | Le code couvre les mêmes catégories; les textes commerciaux et les détails d'options diffèrent | Garder l'avertissement « bientôt »; valider les options avant de les promettre |
| IA `/ia/` | Le site public nomme « Claude / Anthropic », annonce des plafonds IA de 2 $/10 $/25 $ et une durée de 5 minutes du réceptionniste | `AiPage.tsx` décrit les fonctions envisagées, le consentement, les forfaits proposés **sans fournisseur ni plafond confirmés** | **Ne pas recopier des engagements de fournisseur, coût ou durée avant contrats, garde-fous serveurs, et analyse Loi 25** |
| Comparateur `/comparer/` | Prix proposés, avertissements inactivité jours 20/27, 90 jours de quarantaine, mention conférence/textos de groupe, tableaux de différences | `ComparePage.tsx` intègre prix/limites tirés de `@mimt/shared`, anglais/français, données/IA/9-1-1 et liste de fonctions non disponibles | Les délais de recyclage doivent correspondre à l'implémentation, aux conditions et au transporteur avant publication ferme |
| App Web `/app-web/` | Le service est annoncé pour le lancement; appels, SMS, messagerie vocale et portail Affaires | `WebAppPage.tsx` donne le parcours prévu et signale qu'il n'est pas ouvert au public | Ne pas présenter un softphone ou un portail pleinement opérationnel avant essai réel |
| Formulaires | Liste d'attente, démo et contact visibles | Le site utilise `mailto:` sans API; le dépôt inclut un endpoint de leads protégé, **non encore déployé** | Projet DB dédié, migration 0004, endpoint HTTPS, test réel et consentement confirmé avant activation |
| Navigation/footer | Liens d'aide, mentions 9-1-1, CCTS/CPRST et app.mimt.ca | Navigation, SEO et la plupart des routes sont présents; certains liens/étiquettes secondaires diffèrent | Contrôler les deux langues, le clavier et tous les liens avant mise en service |

## Protections mises en code

- `.github/workflows/deploy-web.yml` ne peut lancer le job que si **`MIMT_WEB_DEPLOY_ENABLED=true` et `MIMT_WEB_PARITY_REVIEWED=true`**, après CI réussie.
- Le marqueur distant `.mimt-web-managed` doit contenir exactement **`mimt.ca`** (une ligne avec saut de ligne accepté par `cat`).
- Avant toute écriture, le workflow copie la racine actuelle dans `/home/<SSH USER>/.mimt-web-backups/<SHA>/`, hors du répertoire public.
- Le transfert utilise `rsync` **sans `--delete`**, avec sauvegarde des fichiers écrasés; protège `.htaccess` et le marqueur.
- Vérification finale de `deploy-version.txt` contre le SHA GitHub; l'existence seule du marqueur ou le succès de CI ne constitue pas une preuve de déploiement.

## Conditions d'approbation de la parité

Avant de régler `MIMT_WEB_PARITY_REVIEWED=true`, comparer le rendu FR/EN de la version GitHub en staging au site existant, prendre une sauvegarde, confirmer que les informations retirées ou reclassées « envisagées » correspondent aux décisions produit, puis valider le contenu juridique et les mentions 9-1-1. La variable sert uniquement à confirmer **cette revue**; elle ne remplace pas l'activation CD ni les essais opérateur.

Pour rollback : restaurer l'archive hors public sauvegardée avant le transfert; ne pas faire de force-push. Aucun de ces actes n'a été exécuté sur l'hébergeur dans cette session.

## Preuves consultées

- Site public le 2026-10-14 : https://mimt.ca/ , https://mimt.ca/ia/ , https://mimt.ca/comparer/ , https://mimt.ca/app-web/
- Code : `apps/web/components/pages/HomePage.tsx`, `AiPage.tsx`, `ComparePage.tsx`, `WebAppPage.tsx`, `packages/shared/src/plans.ts`.
- CI GitHub : succès du commit `100e29e7` (durcissement du déploiement); vérifier les runs ultérieurs dans GitHub Actions.
