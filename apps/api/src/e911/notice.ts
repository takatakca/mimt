// Nomadic VoIP 9-1-1 limitations notice (CRTC 2005-21, 2005-61, 2011-619; MIMT-REGULATORY.md §3).
// DRAFT: wording must be approved by counsel before launch. Bump E911_NOTICE_VERSION on any change.

export const NOTICE_REVIEW_STATUS = "Ébauche — à valider par l'avocat / Draft — pending legal review";

const fr = {
  title: "Avis important sur le 9-1-1 — à lire avant d'utiliser MIMT",
  paragraphs: [
    "MIMT est un service de téléphonie Internet (VoIP) nomade. Le 9-1-1 fonctionne différemment d'un téléphone fixe ou cellulaire traditionnel.",
    "Votre position pourrait ne pas être transmise automatiquement aux services d'urgence. Ils utiliseront l'adresse civique que vous avez enregistrée dans MIMT.",
    "Gardez votre adresse 9-1-1 à jour dans l'application chaque fois que vous changez d'endroit (domicile, travail, voyage).",
    "Le service ne fonctionnera pas pendant une panne de courant, une panne Internet ou de réseau de données, ni si votre appareil est éteint ou sa pile est vide.",
    "Votre appel au 9-1-1 pourrait d'abord être reçu par un centre d'appels d'urgence tiers, qui confirmera votre position avant de vous transférer au centre 9-1-1 local.",
    "Dites toujours à la personne qui répond où vous êtes, et ne raccrochez pas avant qu'on vous le demande. Si l'appel coupe, rappelez le 9-1-1.",
    "Informez toutes les personnes qui pourraient utiliser MIMT sur votre appareil de ces limites.",
  ],
  acknowledgement: "J'ai lu et je comprends les limites du service 9-1-1 de MIMT.",
};

const en = {
  title: "Important 9-1-1 notice — read before using MIMT",
  paragraphs: [
    "MIMT is a nomadic internet phone (VoIP) service. 9-1-1 works differently than on a traditional landline or cell phone.",
    "Your location may not be sent automatically to emergency services. They will use the civic address you registered in MIMT.",
    "Keep your 9-1-1 address up to date in the app every time you change location (home, work, travel).",
    "The service will not work during a power outage, an internet or data network outage, or if your device is off or its battery is empty.",
    "Your 9-1-1 call may first be answered by a third-party emergency call centre, which will confirm your location before transferring you to the local 9-1-1 centre.",
    "Always tell the person who answers where you are, and do not hang up until told to. If the call drops, call 9-1-1 again.",
    "Tell everyone who may use MIMT on your device about these limits.",
  ],
  acknowledgement: "I have read and understand the limits of MIMT's 9-1-1 service.",
};

export function e911Notice(version: string, locale: "fr-CA" | "en-CA") {
  // French is always listed first (Charter of the French language); `locale` only says which one the app shows.
  return { version, locale, reviewStatus: NOTICE_REVIEW_STATUS, fr, en };
}
