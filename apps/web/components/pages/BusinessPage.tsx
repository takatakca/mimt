import { PageHero, Shell } from "@/components/Shell";
import { LeadForm } from "@/components/LeadForm";
import { PlanCard } from "@/components/PlanCard";
import { Icon } from "@/components/Visuals";
import { BUSINESS_PLANS, PLANS } from "@/lib/plans-view";
import { href, type Lang } from "@/lib/site";

type IconName = Parameters<typeof Icon>[0]["name"];

const FEATURES: { icon: IconName; fr: [string, string]; en: [string, string] }[] = [
  {
    icon: "phone",
    fr: ["Une ligne par employé", "Chaque personne a son poste et son numéro direct, sur son cellulaire et son ordinateur."],
    en: ["One line per employee", "Everyone gets an extension and a direct number, on mobile and desktop."],
  },
  {
    icon: "menu",
    fr: ["Réceptionniste automatique", "« Pour le service, faites le 1. » Un accueil clair, en français et en anglais, selon vos heures d'ouverture."],
    en: ["Auto-attendant", "“For service, press 1.” A clear greeting in French and English, based on your business hours."],
  },
  {
    icon: "team",
    fr: ["Groupes de sonnerie", "Faites sonner l'équipe des ventes ou du soutien en même temps ou à tour de rôle."],
    en: ["Ring groups", "Ring the sales or support team all at once or in turn."],
  },
  {
    icon: "voicemail",
    fr: ["Messagerie vocale par courriel", "Recevez vos messages vocaux et leur transcription dans votre boîte courriel."],
    en: ["Voicemail to email", "Get voicemails and their transcription in your inbox."],
  },
  {
    icon: "record",
    fr: ["Enregistrement des appels", "Avec Affaires Pro. Un message avise toujours les deux parties que l'appel est enregistré."],
    en: ["Call recording", "With Business Pro. A message always tells both parties the call is recorded."],
  },
  {
    icon: "desk",
    fr: ["Applications mobile et ordinateur", "Répondez où vous êtes : au bureau, à la maison ou sur la route."],
    en: ["Mobile and desktop apps", "Answer wherever you are: office, home or on the road."],
  },
  {
    icon: "admin",
    fr: ["Portail administrateur", "Ajoutez des lignes, changez l'accueil et suivez l'utilisation, sans appeler personne."],
    en: ["Admin portal", "Add lines, change the greeting and track usage, without calling anyone."],
  },
  {
    icon: "number",
    fr: ["Renvoi d'appel", "Renvoyez les appels vers un autre numéro quand vous êtes absent."],
    en: ["Call forwarding", "Forward calls to another number when you're away."],
  },
];

export function BusinessPage({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  return (
    <Shell lang={lang} page="business">
      <PageHero
        eyebrow={fr ? "MIMT Affaires" : "MIMT Business"}
        title={fr ? "Le téléphone d'affaires qui suit votre équipe" : "The business phone that follows your team"}
        lead={
          fr
            ? "Un prix par ligne, tout inclus pour bien accueillir vos clients. Aucun appareil à acheter."
            : "One price per line, with everything you need to greet customers well. No hardware to buy."
        }
      />

      <section className="section" aria-labelledby="biz-features">
        <div className="container">
          <h2 id="biz-features">{fr ? "Ce qui est inclus" : "What's included"}</h2>
          <ul className="grid grid--4 features">
            {FEATURES.map((f) => (
              <li className="card feature" key={f.icon + f.en[0]}>
                <span className="feature__icon">
                  <Icon name={f.icon} />
                </span>
                <h3>{f[lang][0]}</h3>
                <p>{f[lang][1]}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--tint" aria-labelledby="biz-pricing">
        <div className="container">
          <h2 id="biz-pricing">{fr ? "Prix par ligne" : "Per-line pricing"}</h2>
          <p className="section-lead">
            {fr
              ? "Payez seulement pour les lignes que vous utilisez. Prix proposés pour le lancement, avant taxes (TPS/TVQ) et taxe municipale 9-1-1 du Québec."
              : "Pay only for the lines you use. Proposed launch prices, before taxes (GST/QST) and the Québec 9-1-1 municipal tax."}
          </p>
          <div className="grid grid--2">
            {BUSINESS_PLANS.map((c) => (
              <PlanCard key={c} plan={PLANS[c]} lang={lang} highlight={c === "business_pro"} />
            ))}
          </div>
          <p className="fineprint">
            <a href={href(lang, "plans")}>{fr ? "Comparer avec les forfaits MIMT Mobile" : "Compare with MIMT Mobile plans"}</a>
          </p>
        </div>
      </section>

      <section className="section" id="demo" aria-labelledby="demo-title">
        <div className="container waitlist">
          <div>
            <p className="kicker">{fr ? "Démo" : "Demo"}</p>
            <h2 id="demo-title">{fr ? "Demander une démo" : "Request a demo"}</h2>
            <p className="section-lead">
              {fr
                ? "Dites-nous combien de lignes il vous faut et comment vos clients vous joignent aujourd'hui. Nous vous montrerons MIMT Affaires dès qu'il sera prêt pour votre entreprise."
                : "Tell us how many lines you need and how customers reach you today. We'll show you MIMT Business as soon as it's ready for your company."}
            </p>
            <ul className="checklist">
              <li>{fr ? "Réponse en français ou en anglais" : "Answer in French or English"}</li>
              <li>{fr ? "Aucun engagement" : "No commitment"}</li>
            </ul>
          </div>
          <div className="card form-card">
            <LeadForm kind="demo" lang={lang} submitLabel={fr ? "Demander une démo" : "Request a demo"} />
          </div>
        </div>
      </section>
    </Shell>
  );
}
