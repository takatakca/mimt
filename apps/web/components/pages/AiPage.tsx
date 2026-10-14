import { PageHero, Shell } from "@/components/Shell";
import { PLANS, formatCad } from "@/lib/plans-view";
import { href, type Lang } from "@/lib/site";

const features = [
  { fr: ["Résumés vocaux", "Un résumé du message, uniquement après votre consentement; le message original reste disponible."], en: ["Voicemail summaries", "Message summaries only after your consent; the original voicemail remains available."] },
  { fr: ["Réponses suggérées", "De courtes propositions pour vos textos; aucune réponse n’est envoyée sans votre action."], en: ["Suggested replies", "Short text reply suggestions that are never sent without your action."] },
  { fr: ["Appels suspects", "Des signaux de risque sans bloquer les rappels d'urgence."], en: ["Suspicious calls", "Risk signals without blocking emergency calls or callbacks."] },
  { fr: ["Réceptionniste IA", "Un accueil bilingue qui annonce clairement son caractère automatisé."], en: ["AI receptionist", "A bilingual greeting that clearly discloses automation."] },
];

export function AiPage({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  return <Shell lang={lang} page="ai">
    <PageHero eyebrow={fr ? "Intelligence artificielle" : "Artificial intelligence"}
      title={fr ? "Une IA utile, avec votre accord" : "Helpful AI, with your permission"}
      lead={fr ? "Des fonctions en préparation pour les messages et l'accueil téléphonique." : "Planned features for messages and business calls."} />
    <section className="section"><div className="container">
      <div className="notice notice--info" role="note"><strong>{fr ? "Fonctions prévues, pas encore disponibles." : "Planned features, not yet available."}</strong>{" "}{fr ? "Le fournisseur et les conditions seront confirmés avant le lancement." : "The provider and terms will be confirmed before launch."}</div>
      <h2>{fr ? "Ce que nous préparons" : "What we're planning"}</h2>
      <ul className="grid grid--2 features">{features.map((item) => <li className="card feature" key={item.en[0]}><h3>{item[lang][0]}</h3><p>{item[lang][1]}</p></li>)}</ul>
    </div></section>
    <section className="section section--tint"><div className="container prose">
      <h2>{fr ? "Vos données, votre décision" : "Your data, your choice"}</h2>
      <ul>
        <li>{fr ? "L'IA générative sera facultative, désactivée par défaut." : "Generative AI will be optional and off by default."}</li>
        <li>{fr ? "Consentement distinct et révocable, sans effet sur les appels de base." : "Separate, revocable consent, without affecting basic calls."}</li>
        <li>{fr ? "Les transferts hors Québec devront être évalués avant l'activation." : "Transfers outside Québec must be assessed before activation."}</li>
        <li>{fr ? "Un agent IA s'identifiera aux appelants." : "An AI agent will identify itself to callers."}</li>
      </ul>
      <p><a href={href(lang, "privacy")}>{fr ? "Politique de confidentialité" : "Privacy policy"}</a></p>
      <h2>{fr ? "Forfaits envisagés" : "Plans under consideration"}</h2>
      <p>{fr ? "Les fonctionnalités IA demeurent en préparation. Aucun plafond de consommation ni fournisseur d’IA n’est contractuellement confirmé. Les prix proposés ci-dessous sont avant taxes." : "AI features remain in development. No usage limit or AI provider is contractually confirmed. Proposed prices below exclude taxes."}</p>
      <ul>
        {(["premium", "business", "business_pro"] as const).map((code) => (
          <li key={code}>
            <strong>{PLANS[code].name[lang]}</strong>{" — "}
            {formatCad(PLANS[code].monthlyPriceCents, lang)}
            {PLANS[code].perLine ? (fr ? "/ligne/mois" : "/line/month") : (fr ? "/mois" : "/month")}
          </li>
        ))}
      </ul>
      <p>{fr ? "Les forfaits Gratuit et Verrouillage ne promettent aucune IA générative." : "Free and Number Lock plans do not promise generative AI."}</p>
      <p><a href={href(lang, "plans")}>{fr ? "Voir tous les forfaits et leurs limites" : "See every plan and its limits"}</a></p>
    </div></section>
  </Shell>;
}
