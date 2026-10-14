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
| Base de données | Migrations `0001` à `0004`; RLS, séparation des rôles | Projet Supabase Canada non confirmé, aucune migration réellement appliquée ici | À configurer |
| Déploiement site | `Deploy MIMT Website`, synchronisation SSH sur CI validée | Dernières exécutions **skipped** ; variables et marqueur nécessaires | Automatisation non activée |
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
