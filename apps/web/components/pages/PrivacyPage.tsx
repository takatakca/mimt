import { PageHero, Shell } from "@/components/Shell";
import { LegalReview } from "@/components/LegalReview";
import { CONTACT_EMAIL, href, type Lang } from "@/lib/site";

const PROCESSORS = [
  {
    name: "Twilio",
    fr: "Acheminement des appels et des textos, numéros de téléphone, service 9-1-1.",
    en: "Call and text routing, phone numbers, 9-1-1 service.",
  },
  { name: "Stripe", fr: "Paiements sur le Web et facturation.", en: "Web payments and billing." },
  {
    name: "Google",
    fr: "Notifications Android, achats sur Google Play et publicités du forfait Gratuit.",
    en: "Android notifications, Google Play purchases and ads on the Free plan.",
  },
  { name: "Apple", fr: "Notifications iPhone et achats sur l'App Store.", en: "iPhone notifications and App Store purchases." },
  {
    name: "Supabase",
    fr: "Base de données et stockage du service (région Canada visée).",
    en: "Service database and storage (Canadian region targeted).",
  },
];

export function PrivacyPage({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  return (
    <Shell lang={lang} page="privacy">
      <PageHero
        eyebrow={fr ? "Légal" : "Legal"}
        title={fr ? "Politique de confidentialité" : "Privacy policy"}
        lead={fr ? "Ce que nous recueillons, pourquoi, et vos droits." : "What we collect, why, and your rights."}
      />
      <LegalReview note="politique de confidentialité complète (Loi 25 / P-39.1, LPRPDE, règles de confidentialité du CRTC), liste des fournisseurs et transferts hors Québec" />
      <section className="section">
        <div className="container prose">
          <div className="notice notice--info" role="note">
            {fr
              ? "Version préliminaire, en cours de validation juridique. Elle sera finalisée avant le lancement du service."
              : "Preliminary version, under legal review. It will be finalized before the service launches."}
          </div>

          <h2 id="responsable">
            {fr ? "Responsable de la protection des renseignements personnels" : "Person in charge of the protection of personal information"}
          </h2>
          <address className="card contact-card">
            <strong>{fr ? "[Nom et titre — à confirmer]" : "[Name and title — to be confirmed]"}</strong>
            <br />
            MIMT · GROUPE TAKATAK
            <br />
            Montréal (Québec) Canada
            <br />
            {fr ? "Courriel : " : "Email: "}
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(fr ? "Confidentialité" : "Privacy")}`}>{CONTACT_EMAIL}</a>{" "}
            {fr ? "(objet « Confidentialité »; adresse dédiée à confirmer)" : "(subject “Privacy”; dedicated address to be confirmed)"}
          </address>

          {fr ? (
            <>
              <h2>Renseignements que nous recueillons</h2>
              <ul>
                <li>Compte : nom, courriel, numéro de téléphone vérifié, langue.</li>
                <li>9-1-1 : l&apos;adresse municipale que vous enregistrez, transmise aux services d&apos;urgence.</li>
                <li>Service : registres des appels et des textos (numéros, date, durée), messages vocaux, contenu des textos que vous envoyez ou recevez.</li>
                <li>Paiement : géré par Stripe, Apple ou Google. Nous ne conservons pas votre numéro de carte complet.</li>
                <li>Technique : modèle d&apos;appareil, version de l&apos;app, adresse IP, journaux pour la sécurité et la prévention de la fraude.</li>
                <li>Formulaires du site : ce que vous nous écrivez et votre choix de recevoir ou non nos nouvelles.</li>
              </ul>

              <h2>Pourquoi nous les utilisons</h2>
              <ul>
                <li>Fournir le service : acheminer vos appels et textos, la messagerie vocale et le 9-1-1.</li>
                <li>Facturer, prévenir la fraude et protéger le réseau.</li>
                <li>Vous répondre et vous aider.</li>
                <li>Respecter nos obligations légales et réglementaires.</li>
                <li>Publicités du forfait Gratuit : la personnalisation est <strong>désactivée par défaut</strong>; vous pouvez l&apos;activer dans l&apos;app.</li>
                <li>Courriels marketing : seulement avec votre consentement, distinct et facultatif. Désabonnement en tout temps.</li>
              </ul>
              <p>Nous ne vendons pas vos renseignements personnels.</p>

              <h2>Où sont vos données</h2>
              <p>
                Nous hébergeons les données au Canada lorsque c&apos;est possible. Certains fournisseurs peuvent traiter des
                renseignements à l&apos;extérieur du Québec ou du Canada. Avant toute communication hors du Québec, nous évaluons les
                facteurs relatifs à la vie privée et concluons une entente écrite qui protège vos renseignements.
              </p>

              <h2>Nos fournisseurs</h2>
            </>
          ) : (
            <>
              <h2>Information we collect</h2>
              <ul>
                <li>Account: name, email, verified phone number, language.</li>
                <li>9-1-1: the civic address you register, sent to emergency services.</li>
                <li>Service: call and text records (numbers, date, duration), voicemails, content of texts you send or receive.</li>
                <li>Payment: handled by Stripe, Apple or Google. We don&apos;t keep your full card number.</li>
                <li>Technical: device model, app version, IP address, logs for security and fraud prevention.</li>
                <li>Website forms: what you write to us and whether you chose to receive our news.</li>
              </ul>

              <h2>Why we use it</h2>
              <ul>
                <li>Provide the service: route your calls and texts, voicemail and 9-1-1.</li>
                <li>Bill, prevent fraud and protect the network.</li>
                <li>Answer and help you.</li>
                <li>Meet our legal and regulatory obligations.</li>
                <li>Ads on the Free plan: personalization is <strong>off by default</strong>; you can turn it on in the app.</li>
                <li>Marketing emails: only with your separate, optional consent. Unsubscribe at any time.</li>
              </ul>
              <p>We don&apos;t sell your personal information.</p>

              <h2>Where your data is</h2>
              <p>
                We host data in Canada where possible. Some providers may process information outside Québec or Canada. Before any
                transfer outside Québec, we assess the privacy factors and sign a written agreement that protects your information.
              </p>

              <h2>Our providers</h2>
            </>
          )}
          <div className="table-wrap" role="region" aria-label={fr ? "Fournisseurs" : "Providers"} tabIndex={0}>
            <table className="simple">
              <thead>
                <tr>
                  <th scope="col">{fr ? "Fournisseur" : "Provider"}</th>
                  <th scope="col">{fr ? "Rôle" : "Role"}</th>
                </tr>
              </thead>
              <tbody>
                {PROCESSORS.map((p) => (
                  <tr key={p.name}>
                    <th scope="row">{p.name}</th>
                    <td>{p[lang]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {fr ? (
            <>
              <h2>Combien de temps nous les gardons</h2>
              <p>
                Seulement le temps nécessaire aux fins indiquées ou exigé par la loi. Les durées précises par type de renseignement
                seront publiées ici. [À compléter]
              </p>

              <h2>Vos droits</h2>
              <ul>
                <li>Accéder à vos renseignements et les faire corriger.</li>
                <li>Retirer votre consentement (par exemple aux courriels marketing).</li>
                <li>Recevoir vos renseignements dans un format technologique structuré et couramment utilisé (portabilité).</li>
                <li>Demander la désindexation ou la suppression lorsque la loi le permet.</li>
              </ul>
              <p>
                Écrivez au responsable ci-dessus. Nous répondons dans un délai de 30 jours. Vous pouvez aussi vous adresser à la
                Commission d&apos;accès à l&apos;information du Québec (cai.gouv.qc.ca) ou au Commissariat à la protection de la vie
                privée du Canada (priv.gc.ca).
              </p>

              <h2>Incidents de confidentialité</h2>
              <p>
                Si un incident présente un risque de préjudice sérieux, nous avisons la Commission d&apos;accès à l&apos;information
                et les personnes concernées, et nous tenons un registre des incidents.
              </p>

              <h2>Témoins (cookies) sur ce site</h2>
              <p>Ce site n&apos;utilise pas de témoins publicitaires ni d&apos;outil de suivi.</p>
            </>
          ) : (
            <>
              <h2>How long we keep it</h2>
              <p>
                Only as long as needed for the stated purposes or as required by law. Specific periods per type of information will
                be published here. [To be completed]
              </p>

              <h2>Your rights</h2>
              <ul>
                <li>Access your information and have it corrected.</li>
                <li>Withdraw your consent (for example to marketing emails).</li>
                <li>Receive your information in a structured, commonly used technological format (portability).</li>
                <li>Ask for de-indexing or deletion where the law allows.</li>
              </ul>
              <p>
                Write to the person in charge above. We answer within 30 days. You can also contact the Commission d&apos;accès à
                l&apos;information du Québec (cai.gouv.qc.ca) or the Office of the Privacy Commissioner of Canada (priv.gc.ca).
              </p>

              <h2>Confidentiality incidents</h2>
              <p>
                If an incident presents a risk of serious injury, we notify the Commission d&apos;accès à l&apos;information and the
                people affected, and we keep an incident register.
              </p>

              <h2>Cookies on this site</h2>
              <p>This site uses no advertising cookies or tracking tools.</p>
            </>
          )}
          <p className="fineprint">
            {fr ? "Dernière mise à jour : [date à confirmer]. Voir aussi nos " : "Last updated: [date to be confirmed]. See also our "}
            <a href={href(lang, "terms")}>{fr ? "conditions" : "terms"}</a>.
          </p>
        </div>
      </section>
    </Shell>
  );
}
