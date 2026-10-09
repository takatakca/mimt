import { PageHero, Shell } from "@/components/Shell";
import { LegalReview } from "@/components/LegalReview";
import { CCTS_URL, CONTACT_EMAIL, href, type Lang } from "@/lib/site";

export function ComplaintsPage({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  const ccts = CCTS_URL;
  return (
    <Shell lang={lang} page="complaints">
      <PageHero
        eyebrow={fr ? "Soutien" : "Support"}
        title={fr ? "Plaintes" : "Complaints"}
        lead={
          fr
            ? "Un problème avec MIMT? Dites-le-nous. Voici comment nous traitons les plaintes, et vers qui vous tourner si nous ne la réglons pas."
            : "A problem with MIMT? Tell us. Here is how we handle complaints, and where to turn if we don't resolve yours."
        }
      />
      <LegalReview note="processus de plaintes, délais de réponse et texte CPRST/CCTS" />
      <section className="section">
        <div className="container prose">
          <h2>{fr ? "1. Écrivez-nous" : "1. Write to us"}</h2>
          <p>
            {fr ? "Utilisez le " : "Use the "}
            <a href={href(lang, "contact")}>{fr ? "formulaire de contact" : "contact form"}</a>
            {fr ? " (sujet « Plainte ») ou écrivez à " : " (topic “Complaint”) or write to "}
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(fr ? "Plainte" : "Complaint")}`}>{CONTACT_EMAIL}</a>
            {fr
              ? ". Indiquez votre numéro MIMT, la date du problème et ce que vous attendez de nous."
              : ". Include your MIMT number, the date of the problem and what you expect from us."}
          </p>
          <p>
            {fr
              ? "Nous accusons réception et vous donnons un numéro de dossier. Nous visons une réponse complète en 10 jours ouvrables."
              : "We acknowledge your complaint and give you a file number. We aim to give a full answer within 10 business days."}
          </p>

          <h2>{fr ? "2. Demandez une révision" : "2. Ask for a review"}</h2>
          <p>
            {fr
              ? "Si la réponse ne vous satisfait pas, répondez au même courriel en demandant une révision. Une personne responsable, qui n'a pas traité votre première demande, revoit le dossier et vous donne notre réponse finale."
              : "If you're not satisfied with the answer, reply to the same email and ask for a review. A manager who did not handle your first request reviews the file and gives you our final answer."}
          </p>

          <h2>{fr ? "3. Le CPRST, si nous ne réglons pas votre plainte" : "3. The CCTS, if we don't resolve your complaint"}</h2>
          <div className="card ccts">
            <p>
              {fr ? (
                <>
                  La <strong>Commission des plaintes relatives aux services de télécom-télévision (CPRST)</strong> est un organisme
                  indépendant qui aide gratuitement les consommateurs et les petites entreprises à régler leurs plaintes au sujet de
                  leurs services de télécommunication. Les fournisseurs de services de télécommunication au Canada doivent y
                  participer.
                </>
              ) : (
                <>
                  The <strong>Commission for Complaints for Telecom-television Services (CCTS)</strong> is an independent
                  organization that helps consumers and small businesses resolve complaints about their telecom services, free of
                  charge. Telecom service providers in Canada must participate in it.
                </>
              )}
            </p>
            <p>
              {fr
                ? "Le CPRST demande normalement que vous ayez d'abord essayé de régler le problème avec nous."
                : "The CCTS normally asks that you first try to resolve the problem with us."}
            </p>
            <p>
              <a className="btn btn--primary" href={ccts} rel="noopener">
                {fr ? "Visiter ccts-cprst.ca" : "Visit ccts-cprst.ca"}
              </a>
            </p>
            <p className="fineprint">{fr ? "Téléphone sans frais du CPRST : 1-888-221-1687" : "CCTS toll-free: 1-888-221-1687"}</p>
          </div>

          <h2>{fr ? "Autres ressources" : "Other resources"}</h2>
          <ul>
            <li>
              {fr ? "Renseignements personnels : voir notre " : "Personal information: see our "}
              <a href={href(lang, "privacy")}>{fr ? "politique de confidentialité" : "privacy policy"}</a>.
            </li>
            <li>
              {fr ? "Accessibilité : voir notre page " : "Accessibility: see our "}
              <a href={href(lang, "accessibility")}>{fr ? "Accessibilité" : "Accessibility page"}</a>.
            </li>
          </ul>
        </div>
      </section>
    </Shell>
  );
}
