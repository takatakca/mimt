# MIMT — Journal des décisions

Mise à jour : 2026-10-14. Distinguer décisions approuvées, orientations de code et points encore sans validation.

| ID | Décision en vigueur | Raison / contrainte | Source / validation |
| --- | --- | --- | --- |
| D-01 | MIMT est un produit autonome, membre de GROUPE TAKATAK; TAKATAK reste l'autorité d'identité, de droits et d'activation | Ne pas fusionner les interfaces et ne pas créer un CRM maître concurrent | `AGENTS.md`, `README.md`, `docs/MIMT-MVP.md` |
| D-02 | Français d'abord, anglais second | Québec; site statique `/` + `/en/` | `apps/web` |
| D-03 | Marque électrique bleue sur bleu marine; vert réservé aux états | Cohérence de marque | `docs/BRAND.md` |
| D-04 | Next.js export statique pour mimt.ca, API Fastify Node 22 et app Expo native | Site hébergeable sans build lourd sur MochaHost; code partagé TypeScript | `README.md`, `apps/web/README.md` |
| D-05 | Base MIMT séparée de TAKATAK, RLS et accès serveur seulement aux secrets | Isolation réglementaire et par produit; Loi 25 | `supabase/README.md` |
| D-06 | 9-1-1 toujours prioritaire, malgré dépassements de forfait | Exigence télécom et sécurité | `AGENTS.md`, tests API |
| D-07 | Pas de déploiement SSH sans preuve de la racine de mimt.ca | Éviter écrasement d'un site public différent | `.github/workflows/deploy-web.yml` |
| D-08 | Les formulaires Web peuvent envoyer au serveur MIMT après configuration; sinon ouvrir un courriel | Le site reste utilisable sans API; ne pas feindre qu'un lead a été reçu | `apps/web/components/LeadForm.tsx` |
| D-09 | Demande de consentement marketing distincte du contact; désactivée par défaut; jamais une preuve de consentement vérifié sans étape de confirmation | LCAP / Loi 25; `public_leads.marketing_opt_in_requested` | `apps/api/src/routes/publicLeads.ts` |
| D-10 | Fonctions IA encore en projet et soumis à consentement, pas de fournisseur garanti par le seul code du site | Les textes live et les implémentations ne sont pas intégralement synchronisés | `apps/web/components/pages/AiPage.tsx` |
| D-11 | Tarifs présentés comme propositions, pas comme offres en vigueur | Marché et coûts transporteur à valider | `packages/shared/src/plans.ts`, `docs/MIMT-MVP.md` |

| D-12 | Une première publication du site exige une revue de parité explicite; aucune suppression de fichiers distants, sauvegarde pré-déploiement hors répertoire public, marqueur nommé `mimt.ca` | Eviter d'écraser un site existant plus complet | `.github/workflows/deploy-web.yml`, `docs/WEB_PARITY_AUDIT.md` |

| D-13 | Conserver dans la CI des assertions d'avis pré-lancement bilingues et de références au 9-1-1 dans les pages clés | Éviter qu'une page statique présente un service non ouvert comme déjà commercialisé | `apps/web/scripts/check-export.mjs`, CI run `38624276434` |

## Décisions ou validations toujours ouvertes

- Confirmation du fournisseur, des tarifs finaux et des contrats légaux, notamment l'IA et les échanges hors Québec.
- Nom et fonction officiels du responsable de la protection des renseignements personnels; durées de rétention.
- Qui héberge le site public, comment accéder à sa racine documentaire, et si la synchronisation remplace le site en place ou passe par un staging.
- CRTC/CCTS, accès à Twilio production, routage 9-1-1, magasins Apple/Google, capacité PBX Affaires.
- Validation du canal d'envoi (courriel, API) et du processus de double confirmation marketing avant toute campagne.

**Vérification 2026-10-14 :** aucun projet MIMT n'apparaît dans les cinq projets de la connexion Supabase accessible. On ne réutilise **pas** TAKATAK STAGING comme base télécom MIMT.

**Réserve IA (WEB-01) :** la production publiée mentionne « Claude/Anthropic » et des limites monétaires IA qui ne sont pas vérifiées comme intégrées, contractées ou appliquées par l'API. La copie GitHub présente ces capacités comme prévues; ne pas engager contractuellement des fournisseurs ou des montants à partir du seul texte live.

## Décisions techniques — validation sécurité/qualité du 14 octobre 2026

- **D-14 / Proxys :** ne faire confiance à `X-Forwarded-For` que lorsque l'adresse IP immédiate est dans `TRUSTED_PROXY_CIDRS`. Aucun proxy fiable par défaut; ne pas autoriser tous les réseaux. Justification : empêcher les clients non fiables de contourner les limites IP en forgeant des en-têtes. Code `apps/api/src/app.ts`, `config.ts`; CI `38626239265` réussie.
- **D-15 / Liens :** refuser la publication d'un export Web comprenant des liens internes manquants ou des ancres invalides; vérifier les deux langues. Code `apps/web/scripts/check-links.mjs`; CI `38625918929` réussie.
- **Décision ouverte :** sélectionner les IP du proxy réel et une limitation de requêtes centralisée avant l'usage multi-instance. Ne jamais confondre contrôle de qualité du site statique et essai télécom réel.

## D-16 — Limiteur mémoire à capacité bornée (15 octobre 2026)

Il est interdit d'évincer une clé encore active pour accueillir de nouvelles clés de requêtes : cela effacerait son quota de sécurité. Le limiteur mono-processus purge seulement les entrées inactives dont la fenêtre de recharge est écoulée, puis **refuse** les nouvelles clés si les 50 000 emplacements sont occupés; les règles invalides et retours d'horloge ne donnent aucun jeton. Les règles anti-abus du 9-1-1 sont exclues de son chemin prioritaire. Ce mécanisme limite l'empreinte mémoire mais ne remplace pas un compteur partagé pour plusieurs instances. `apps/api/src/fraud/rateLimiter.ts`, CI `38734095766`.

## D-17 — Quotas métier atomiques privés (15 octobre 2026)

Implémenter les quotas anti-abus métier partagés sur la base PostgreSQL **MIMT uniquement** : une transaction et un verrou `SELECT FOR UPDATE` sérialisent les crédits par identité; conserver uniquement un HMAC-SHA256 des clés avec secret distinct `RATE_LIMIT_HMAC_KEY`, refuser les demandes limitées en cas de panne sans repli sur des quotas locaux. La table est privée avec RLS, ni `anon` ni `authenticated` ne doivent y avoir accès; les enregistrements expirés peuvent être purgés après la fenêtre de recharge plus une marge. Le chemin d'appel d'urgence 9-1-1 ne consulte pas ce limiteur. Code `apps/api/src/fraud/postgresRateLimiter.ts`, migration `20261015173000_shared_rate_limit_buckets.sql`; CI réelle `38775431115` réussie.

**Non approuvé :** activation en production ou plusieurs réplicas avant projet MIMT dédié, migration appliquée, secret sécurisé, limite HTTP distribuée et coordination de l'outbox. Cette décision ne prétend pas que les contraintes télécom/CRTC sont satisfaites.

## D-18 — Disponibilité Postgres conditionnée aux migrations et à RLS (15 octobre 2026)

Un simple `select 1` ne suffit pas à dire l'API télécom prête. `PostgresRepository.ping` vérifie les 24 tables de la base MIMT attendue (schéma `public`) avec RLS actif avant le statut `/readyz` ; une base partiellement migrée doit retourner `503`. Justification : éviter le faux « prêt » et l'ouverture d'une API privée dépourvue de protections structurelles. Code `apps/api/src/repo/postgres.ts`, test sur PostgreSQL isolé, [CI #38776170530](https://github.com/takatakca/mimt/actions/runs/38776170530) réussie. **Limite :** des politiques RLS incorrectes peuvent exister malgré le drapeau actif; des essais multi-rôles restent obligatoires avant production.

## Décisions D-17 et D-18 — 15 octobre 2026

- **D-17 / Quota HTTP inter-instances :** ajouter un contrôle de 300 requêtes/minute/IP à l'aide du même magasin PostgreSQL et des clés HMAC que les limites métier, sans rediriger les appels d'urgence, les opérations E911, la santé ni les callbacks signés dans un chemin bloqué par la base anti-abus. Les quotas par route fournis par Fastify restent locaux. Vérification CI `38791371698`.
- **D-18 / Outbox TAKATAK at-least-once :** réserver les événements via verrous de lignes `SKIP LOCKED` et `next_attempt_at` avec bail court, sans nouvelle table ni migration. Cette réservation résout la concurrence ordinaire des travailleurs, **pas** le cas succès HTTP suivi d'un crash avant l'acquittement SQL. Les récepteurs TAKATAK doivent implémenter l'idempotence sur l'ID stable. Vérification CI `38792255274`. Toute modification de TAKATAK nécessite une coordination distincte.
