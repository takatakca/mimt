import { PageHero, Shell } from "@/components/Shell";
import { CONTACT_EMAIL, href, type Lang } from "@/lib/site";

export function AccessibilityPage({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  return (
    <Shell lang={lang} page="accessibility">
      <PageHero
        eyebrow={fr ? "Légal" : "Legal"}
        title={fr ? "Accessibilité" : "Accessibility"}
        lead={fr ? "MIMT doit être utilisable par tout le monde." : "MIMT should work for everyone."}
      />
      <section className="section">
        <div className="container prose">
          {fr ? (
            <>
              <h2>Notre objectif</h2>
              <p>
                Nous visons la conformité aux Règles pour l&apos;accessibilité des contenus Web (WCAG) 2.1, niveau AA, sur ce site
                et dans l&apos;app : contraste suffisant, navigation au clavier, compatibilité avec les lecteurs d&apos;écran, texte
                agrandissable.
              </p>
              <h2>Dans l&apos;app</h2>
              <ul>
                <li>Étiquettes pour les lecteurs d&apos;écran (VoiceOver, TalkBack).</li>
                <li>Respect de la taille de texte choisie sur votre appareil.</li>
                <li>Transcription de la messagerie vocale (forfaits Premium et Affaires).</li>
              </ul>
              <h2>Services de relais et 9-1-1</h2>
              <p>
                Si vous utilisez un service de relais (ATS ou relais IP), le 9-1-1 peut comporter des limites. Lisez notre{" "}
                <a href={href(lang, "e911")}>page 9-1-1</a>. Nous vous rappelons ces limites à l&apos;inscription et chaque année.
              </p>
              <h2>Formats adaptés</h2>
              <p>
                Nos conditions, notre avis 9-1-1 et nos factures sont offerts en formats adaptés (gros caractères, texte brut, etc.)
                sur demande, sans frais.
              </p>
              <h2>Nous joindre</h2>
              <p>
                Un obstacle sur le site ou dans l&apos;app? Écrivez à <a href={`mailto:${CONTACT_EMAIL}?subject=Accessibilit%C3%A9`}>{CONTACT_EMAIL}</a>{" "}
                ou utilisez le <a href={href(lang, "contact")}>formulaire de contact</a> (sujet « Accessibilité »).
              </p>
            </>
          ) : (
            <>
              <h2>Our goal</h2>
              <p>
                We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1, level AA, on this site and in the app: enough
                contrast, keyboard navigation, screen-reader support, resizable text.
              </p>
              <h2>In the app</h2>
              <ul>
                <li>Screen-reader labels (VoiceOver, TalkBack).</li>
                <li>Respects the text size set on your device.</li>
                <li>Voicemail transcription (Premium and Business plans).</li>
              </ul>
              <h2>Relay services and 9-1-1</h2>
              <p>
                If you use a relay service (TTY or IP Relay), 9-1-1 may have limits. Read our <a href={href(lang, "e911")}>9-1-1 page</a>.
                We remind you of these limits at sign-up and every year.
              </p>
              <h2>Alternative formats</h2>
              <p>Our terms, 9-1-1 notice and bills are available in alternative formats (large print, plain text, etc.) on request, free.</p>
              <h2>Contact us</h2>
              <p>
                Found a barrier on the site or in the app? Write to <a href={`mailto:${CONTACT_EMAIL}?subject=Accessibility`}>{CONTACT_EMAIL}</a>{" "}
                or use the <a href={href(lang, "contact")}>contact form</a> (topic &ldquo;Accessibility&rdquo;).
              </p>
            </>
          )}
        </div>
      </section>
    </Shell>
  );
}
