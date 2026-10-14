import { PageHero, Shell } from "@/components/Shell";
import { href, type Lang } from "@/lib/site";

const features = [
  { fr: ["Appels sur ordinateur", "Un clavier, un micro et le même numéro MIMT."], en: ["Desktop calls", "A dial pad, microphone and the same MIMT number."] },
  { fr: ["Textos", "Vos conversations synchronisées avec votre téléphone."], en: ["Texts", "Conversations synchronized with your phone."] },
  { fr: ["Messagerie vocale", "Écoute et transcription selon votre forfait."], en: ["Voicemail", "Playback and transcription depending on your plan."] },
  { fr: ["Portail Affaires", "Gestion des lignes et de l'accueil de votre équipe."], en: ["Business portal", "Manage your team lines and greetings."] },
];

export function WebAppPage({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  return <Shell lang={lang} page="webapp">
    <PageHero eyebrow={fr ? "App Web" : "Web app"}
      title={fr ? "Votre numéro, aussi sur l'ordinateur" : "Your number, also on desktop"}
      lead={fr ? "Un navigateur pour appeler, texter et gérer vos services MIMT." : "A browser for calling, texting and managing MIMT services."} />
    <section className="section"><div className="container">
      <div className="notice notice--info" role="note"><strong>{fr ? "En préparation." : "In development."}</strong>{" "}{fr ? "L'app Web et ses connexions ne sont pas encore ouvertes au public." : "Web app sign-in and calling are not yet publicly available."}</div>
      <h2>{fr ? "Fonctions prévues" : "Planned features"}</h2>
      <ul className="grid grid--2 features">{features.map((item) => <li className="card feature" key={item.en[0]}><h3>{item[lang][0]}</h3><p>{item[lang][1]}</p></li>)}</ul>
      <div className="cta-row">
        <a className="btn btn--primary" href={href(lang, "home", fr ? "liste-attente" : "waitlist")}>{fr ? "Rejoindre la liste d'attente" : "Join the waitlist"}</a>
        <a className="btn btn--outline" href="https://app.mimt.ca/" rel="noopener noreferrer">app.mimt.ca</a>
      </div>
    </div></section>
    <section className="section section--tint"><div className="container prose">
      <h2>{fr ? "Avant de commencer" : "Before you begin"}</h2>
      <p>{fr ? "Un compte MIMT actif, un navigateur récent, un micro et une connexion stable seront nécessaires." : "You will need an active MIMT account, a current browser, a microphone and a stable connection."}</p>
      <p>{fr ? "Le 9-1-1 par Internet est soumis à des limites importantes : l'adresse doit rester à jour." : "Internet-based 9-1-1 has important limits: your emergency address must stay current."}{" "}<a href={href(lang, "e911")}>{fr ? "En savoir plus" : "Learn more"}</a></p>
    </div></section>
  </Shell>;
}
