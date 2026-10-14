# @mimt/web — site public mimt.ca

**Français d'abord · [English below](#english)**

Site vitrine statique de MIMT (Next.js 16, App Router, TypeScript, `output: "export"`). Le français (fr-CA) est à `/`, l'anglais (en-CA) sous `/en/`. Les prix viennent de `@mimt/shared` (`PLANS`, `ADD_ONS`, `formatCad`) : une seule source de vérité.

## Développement

```bash
# depuis la racine du dépôt
pnpm install
pnpm --filter @mimt/shared build   # le site importe le paquet compilé (dist/)
pnpm --filter @mimt/web dev        # http://localhost:3000
pnpm --filter @mimt/web typecheck
```

## Compilation

```bash
pnpm --filter @mimt/web build      # compile aussi @mimt/shared, puis exporte vers apps/web/out/
```

`out/` contient des fichiers HTML/CSS/JS ordinaires (un dossier par page, `trailingSlash: true`), plus `sitemap.xml`, `robots.txt`, `404.html`, `og.png`.

## Variables d'environnement (lues à la compilation)

| Variable | Rôle | Défaut |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL canonique, hreflang, sitemap, Open Graph | `https://mimt.ca` |
| `NEXT_PUBLIC_FORMS_ENDPOINT` | URL où les formulaires (liste d'attente, démo, contact) envoient un `POST` JSON (l'API MIMT plus tard) | vide → le formulaire ouvre le courriel du visiteur vers `info@mimt.ca` (`mailto:`) |

Voir `.env.example`. Aucun secret : ces valeurs sont publiques et intégrées au JavaScript.

Corps JSON envoyé : `{ form: "waitlist" | "demo" | "contact", locale, fields: {...}, consents: { marketing: boolean, marketingText }, page, submittedAt }`. La case de consentement marketing (LCAP) est facultative, décochée par défaut et distincte de la demande. L'API doit accepter CORS depuis `https://mimt.ca`.

## Déploiement

**MochaHost (cPanel)** : `pnpm --filter @mimt/web build`, puis téléverser **le contenu** de `apps/web/out/` dans `public_html/` (FTP ou Gestionnaire de fichiers; compresser en .zip puis « Extraire » est plus rapide). Ajouter `ErrorDocument 404 /404.html` au `.htaccess` si la page 404 n'apparaît pas.

**Coolify** : nouvelle ressource « Static » (ou Nixpacks avec site statique) sur ce dépôt; commande de build `pnpm install --frozen-lockfile && pnpm --filter @mimt/web build`; répertoire publié `apps/web/out`. Définir les variables ci-dessus dans Coolify.

## À faire avant le lancement

- Les textes 9-1-1, Plaintes, Confidentialité et Conditions contiennent un commentaire HTML `à valider par l'avocat` (voir `components/LegalReview.tsx`; `grep -r "valider par l'avocat" out/`).
- Remplacer les espaces réservés : responsable de la protection des renseignements personnels, raison sociale, durées de conservation, date de mise à jour.
- Les prix sont des propositions (docs/MIMT-MVP.md §6) et sont affichés comme tels.
- Polices : Montserrat et Inter via `next/font/google`, auto-hébergées à la compilation (la compilation a besoin d'Internet; sinon remplacer par les polices système dans `lib/fonts.ts`).

---

<a id="english"></a>

# @mimt/web — mimt.ca public website (English)

Static marketing site for MIMT (Next.js 16, App Router, TypeScript, `output: "export"`). French (fr-CA) is at `/`, English (en-CA) under `/en/`. Prices come from `@mimt/shared` (`PLANS`, `ADD_ONS`, `formatCad`), a single source of truth.

## Develop

```bash
pnpm install
pnpm --filter @mimt/shared build
pnpm --filter @mimt/web dev        # http://localhost:3000
pnpm --filter @mimt/web typecheck
```

## Build

```bash
pnpm --filter @mimt/web build      # also builds @mimt/shared, then exports to apps/web/out/
```

## Environment variables (read at build time)

- `NEXT_PUBLIC_SITE_URL` — canonical URL, hreflang, sitemap, Open Graph. Default `https://mimt.ca`.
- `NEXT_PUBLIC_FORMS_ENDPOINT` — where the waitlist, demo and contact forms `POST` JSON (the MIMT API later). Empty: forms open the visitor's email app to `info@mimt.ca`.

No secrets: these values are public. The CASL marketing checkbox is optional, unchecked by default and separate from the request.

## Deploy

- **MochaHost:** build, then upload the **contents** of `apps/web/out/` to `public_html/` (FTP or File Manager; upload a .zip and Extract is fastest). Add `ErrorDocument 404 /404.html` to `.htaccess` if needed.
- **Coolify:** Static resource on this repo; build command `pnpm install --frozen-lockfile && pnpm --filter @mimt/web build`; publish directory `apps/web/out`; set the variables above.

## Before launch

Legal texts (9-1-1, complaints, privacy, terms) carry an HTML comment `à valider par l'avocat` and placeholders to fill (privacy officer, legal name, retention periods). Prices are proposals and are labelled as such.

## Déploiement automatique GitHub → MIMT.CA (14 octobre 2026)

La CI vérifie le typage et les tests, exporte les 28 pages FR/EN puis publie l'artéfact `mimt-web-static`.
Le flux `.github/workflows/deploy-web.yml` déploie exactement cet artéfact après une CI réussie sur `main`.
Il ne bâtit rien sur MochaHost. Le site est déjà accessible mais l'hébergeur réel et sa racine de document doivent être vérifiés avant toute synchronisation.

### Paramètres GitHub Actions requis

| Type | Nom | Signification |
| --- | --- | --- |
| Variable | `MIMT_WEB_DEPLOY_ENABLED` | `true` uniquement après validation du répertoire cible; autrement rien n'est publié |
| Variable | `MIMT_WEB_HOST` | Hôte SSH du serveur Web qui héberge réellement mimt.ca |
| Variable | `MIMT_WEB_PORT` | Port SSH, typiquement 22 |
| Variable | `MIMT_WEB_USER` | Utilisateur SSH |
| Variable | `MIMT_WEB_REMOTE_DIR` | Dossier public dédié à mimt.ca, chemin absolu sous /home/ |
| Secret | `MIMT_WEB_SSH_PRIVATE_KEY` | Clé privée de déploiement dédiée |
| Secret | `MIMT_WEB_KNOWN_HOSTS` | Empreinte vérifiée de l'hôte SSH, au format known_hosts |

Avant d'activer, créer **manuellement** un fichier `.mimt-web-managed` dans le répertoire cible. Cette protection refuse les déploiements dans un dossier non identifié comme MIMT. Le workflow préserve ce fichier et le `.htaccess` existant, puis vérifie le hash réellement publié sur `https://mimt.ca/deploy-version.txt`.

Ne jamais utiliser le dossier public d'un autre site ni activer le workflow si le répertoire contient des fichiers non-MIMT. N'envoyez pas les secrets dans le code ou dans un message.

Le site GitHub couvre depuis le 14 octobre les anciennes pages manquantes `/ia/`, `/comparer/` et `/app-web/` (et leurs versions anglaises). La présence des pages sur GitHub ne confirme pas à elle seule un déploiement sur l'hébergement.

### Avant mise en service commerciale

Les prix sont des propositions; le fournisseur d'IA, les textes juridiques, le 9-1-1, les intégrations de téléphonie et les comptes d'hébergement restent à valider indépendamment. Les formulaires ont un repli courriel lorsque `NEXT_PUBLIC_FORMS_ENDPOINT` est vide.

## Collecte persistante des formulaires (en cours d'intégration)

L'API inclut `POST https://api.mimt.ca/v1/public/leads` et `supabase/migrations/0004_public_leads.sql`. Elle valide les champs FR/EN, refuse les origines étrangères et limite les envois. La réponse est `202 {"accepted":true}` après écriture dans une table privée. La demande de consentement marketing ne devient jamais un abonnement actif sans vérification du courriel.

Le build GitHub Actions utilise la variable publique `MIMT_WEB_FORMS_ENDPOINT`, qui peut être vide ou valoir exactement `https://api.mimt.ca/v1/public/leads`. Ne la configurer qu'après déploiement et vérification réelle de l'API et des migrations. Sans cela, le formulaire conserve son repli vers le courriel de contact.

Avant d'activer la synchronisation du site, comparer les contenus du site live et ceux de GitHub : des pages existantes sont plus détaillées et `rsync --delete` risque de les remplacer.

### Parité avant première publication

Consulter `docs/WEB_PARITY_AUDIT.md`. En complément de `MIMT_WEB_DEPLOY_ENABLED=true`, définir `MIMT_WEB_PARITY_REVIEWED=true` **seulement après** revue du site live et de la version FR/EN en staging. Le marqueur distant doit contenir `mimt.ca`, et les mises à jour sauvegardent d'abord le site hors répertoire public sous `~/.mimt-web-backups/<SHA>/`. La synchronisation ne supprime plus automatiquement les fichiers distants.
