import { PageHero, Shell } from "@/components/Shell";
import { LeadForm } from "@/components/LeadForm";
import { CONTACT_EMAIL, href, type Lang } from "@/lib/site";

export function ContactPage({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  return (
    <Shell lang={lang} page="contact">
      <PageHero
        eyebrow={fr ? "Soutien" : "Support"}
        title={fr ? "Nous joindre" : "Contact us"}
        lead={fr ? "Une question, une idée, un partenariat? On vous répond en français ou en anglais." : "A question, an idea, a partnership? We answer in French or English."}
      />
      <section className="section">
        <div className="container waitlist">
          <div>
            <h2>{fr ? "Par courriel" : "By email"}</h2>
            <p>
              <a className="big-link" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </p>
            <p>MIMT · GROUPE TAKATAK · Montréal (Québec)</p>
            <h2 className="mt-l">{fr ? "Raccourcis" : "Shortcuts"}</h2>
            <ul className="link-list">
              <li>
                <a href={href(lang, "help")}>{fr ? "Questions fréquentes" : "FAQ"}</a>
              </li>
              <li>
                <a href={href(lang, "business", "demo")}>{fr ? "Demander une démo MIMT Affaires" : "Request a MIMT Business demo"}</a>
              </li>
              <li>
                <a href={href(lang, "complaints")}>{fr ? "Déposer une plainte" : "Make a complaint"}</a>
              </li>
              <li>
                <a href={href(lang, "privacy", "responsable")}>
                  {fr ? "Responsable de la protection des renseignements personnels" : "Privacy officer"}
                </a>
              </li>
            </ul>
          </div>
          <div className="card form-card">
            <h2 className="form-card__title">{fr ? "Écrivez-nous" : "Write to us"}</h2>
            <LeadForm kind="contact" lang={lang} />
          </div>
        </div>
      </section>
    </Shell>
  );
}
