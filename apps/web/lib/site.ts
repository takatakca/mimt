import type { Metadata } from "next";

export type Lang = "fr" | "en";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://mimt.ca").replace(/\/$/, "");
export const CONTACT_EMAIL = "info@mimt.ca";
export const CCTS_URL = "https://www.ccts-cprst.ca";

/** Every page, with its French and English path (trailing slash: static export writes folders). */
export const ROUTES = {
  home: { fr: "/", en: "/en/" },
  plans: { fr: "/forfaits/", en: "/en/plans/" },
  business: { fr: "/affaires/", en: "/en/business/" },
  soon: { fr: "/bientot/", en: "/en/coming-soon/" },
  e911: { fr: "/9-1-1/", en: "/en/9-1-1/" },
  help: { fr: "/aide/", en: "/en/help/" },
  complaints: { fr: "/plaintes/", en: "/en/complaints/" },
  privacy: { fr: "/confidentialite/", en: "/en/privacy/" },
  terms: { fr: "/conditions/", en: "/en/terms/" },
  accessibility: { fr: "/accessibilite/", en: "/en/accessibility/" },
  contact: { fr: "/contact/", en: "/en/contact/" },
} as const;

export type RouteKey = keyof typeof ROUTES;

export function href(lang: Lang, key: RouteKey, hash?: string): string {
  return ROUTES[key][lang] + (hash ? `#${hash}` : "");
}

export const LABELS: Record<RouteKey, { fr: string; en: string }> = {
  home: { fr: "Accueil", en: "Home" },
  plans: { fr: "Forfaits", en: "Plans" },
  business: { fr: "Affaires", en: "Business" },
  soon: { fr: "Bientôt", en: "Coming soon" },
  e911: { fr: "9-1-1", en: "9-1-1" },
  help: { fr: "Aide", en: "Help" },
  complaints: { fr: "Plaintes", en: "Complaints" },
  privacy: { fr: "Confidentialité", en: "Privacy" },
  terms: { fr: "Conditions", en: "Terms" },
  accessibility: { fr: "Accessibilité", en: "Accessibility" },
  contact: { fr: "Contact", en: "Contact" },
};

export const MAIN_NAV: RouteKey[] = ["plans", "business", "soon", "help", "contact"];

/** Per-page metadata with canonical, hreflang (fr-CA / en-CA) and Open Graph. */
export function pageMeta(lang: Lang, key: RouteKey, title: string, description: string): Metadata {
  const url = SITE_URL + ROUTES[key][lang];
  const fullTitle = key === "home" ? title : `${title} | MIMT`;
  return {
    metadataBase: new URL(SITE_URL),
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
      languages: {
        "fr-CA": SITE_URL + ROUTES[key].fr,
        "en-CA": SITE_URL + ROUTES[key].en,
        "x-default": SITE_URL + ROUTES[key].fr,
      },
    },
    openGraph: {
      type: "website",
      siteName: "MIMT",
      title: fullTitle,
      description,
      url,
      locale: lang === "fr" ? "fr_CA" : "en_CA",
      alternateLocale: lang === "fr" ? "en_CA" : "fr_CA",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "MIMT" }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: ["/og.png"] },
    icons: { icon: "/favicon.svg" },
  };
}
