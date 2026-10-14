import { PageHero, Shell } from "@/components/Shell";
import { PLANS, formatCad } from "@/lib/plans-view";
import { href, type Lang } from "@/lib/site";

const rows = [
  { fr: ["Numéro canadien", "Choix selon disponibilité", "Selon les offres"], en: ["Canadian number", "Choose subject to availability", "Varies by provider"] },
  { fr: ["Gratuit", "30 minutes et 50 textos sortants/mois", "Limites et publicité variables"], en: ["Free tier", "30 outbound minutes and 50 texts/month", "Limits and ads vary"] },
  { fr: ["Numéro inactif", "Avis avant récupération après 30 jours", "Politique propre à chaque service"], en: ["Inactive number", "Notice before reclaiming after 30 days", "Service-specific policy"] },
  { fr: ["Langues", "Français d'abord, anglais aussi", "Variable"], en: ["Languages", "French first, also English", "Varies"] },
  { fr: ["Tarifs et taxes", "Prix proposés en CAD, taxes et 9-1-1 du Québec en sus", "Selon le forfait et la région"], en: ["Prices and taxes", "Proposed CAD prices, taxes and Québec 9-1-1 levy extra", "Depends on the plan and region"] },
  { fr: ["Données", "Base canadienne prévue, transferts hors Québec à évaluer", "Selon la politique du fournisseur"], en: ["Data location", "Canadian database planned, transfers outside Québec to be assessed", "Depends on provider policy"] },
  { fr: ["IA générative", "Facultative, envisagée, non encore lancée", "Varie selon le service"], en: ["Generative AI", "Optional, planned, not yet launched", "Varies by service"] },
  { fr: ["9-1-1", "Adresse enregistrée, limites documentées", "À vérifier selon le service"], en: ["9-1-1", "Registered address, documented limitations", "Check each service"] },
  { fr: ["Entreprises", "Postes et accueil vocal prévus", "Pas toujours disponible"], en: ["Business", "Planned extensions and voice menus", "Not always available"] },
];

export function ComparePage({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  return <Shell lang={lang} page="compare">
    <PageHero eyebrow={fr ? "Comparer" : "Compare"}
      title={fr ? "MIMT et les applications de numéro gratuit" : "MIMT and free-number apps"}
      lead={fr ? "Comparez les modèles de service, pas des marques particulières." : "Compare service models, not specific brands."} />
    <section className="section"><div className="container">
      <div className="notice notice--info" role="note">{fr ? "MIMT n'est pas encore offert. Prix et limites proposés, sujets à validation avant lancement." : "MIMT has not launched. Proposed prices and limits may change before launch."}</div>
      <h2 id="comparison">{fr ? "Point par point" : "Side by side"}</h2>
      <div className="table-wrap" role="region" aria-labelledby="comparison" tabIndex={0}>
        <table className="simple"><caption className="sr-only">{fr ? "Comparaison des applications de numéro" : "Number app comparison"}</caption>
          <thead><tr><th scope="col">{fr ? "Sujet" : "Topic"}</th><th scope="col">MIMT</th><th scope="col">{fr ? "Autres applications" : "Other apps"}</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.en[0]}><th scope="row">{r[lang][0]}</th><td>{r[lang][1]}</td><td>{r[lang][2]}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="fineprint">{fr ? "Gratuit proposé : " : "Proposed Free plan: "}{PLANS.free.caps.outboundMinutes}{fr ? " minutes et " : " minutes and "}{PLANS.free.caps.outboundSms}{fr ? " textos sortants/mois. Premium proposé : " : " outbound texts/month. Proposed Premium: "}<strong>{formatCad(PLANS.premium.monthlyPriceCents, lang)}</strong>{fr ? "/mois, taxes en sus. " : "/month, plus taxes. "}<a href={href(lang, "plans")}>{fr ? "Tous les forfaits" : "All plans"}</a></p>
    </div></section>
    <section className="section section--tint"><div className="container prose">
      <h2>{fr ? "Pas encore disponible" : "Not available yet"}</h2>
      <ul>
        <li>{fr ? "Appels illimités avec le forfait gratuit." : "Unlimited calls on the Free plan."}</li>
        <li>{fr ? "Transfert d'un numéro existant garanti au lancement." : "Guaranteed number porting at launch."}</li>
        <li>{fr ? "Conférences, messagerie vocale par courriel et textos de groupe : disponibilité à confirmer." : "Conference calls, voicemail-to-email and group texts: availability to be confirmed."}</li>
        <li>{fr ? "Internet et cellulaire : aucune date annoncée." : "Internet and cellular: no announced launch date."}</li>
      </ul>
      <p><a href={href(lang, "e911")}>{fr ? "Comprendre les limites du 9-1-1" : "Understand 9-1-1 limits"}</a></p>
    </div></section>
  </Shell>;
}
