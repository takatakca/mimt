import type { ReactNode } from "react";
import { PageHero, Shell } from "@/components/Shell";
import { PLANS, formatCad } from "@/lib/plans-view";
import { CONTACT_EMAIL, href, type Lang } from "@/lib/site";

export function HelpPage({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  const free = PLANS.free.caps;
  const faq: { q: string; a: ReactNode }[] = fr
    ? [
        {
          q: "Quand MIMT sera-t-il offert?",
          a: (
            <>
              MIMT est en préparation et n&apos;est pas encore offert. Aucune date n&apos;est annoncée. Inscrivez-vous à la{" "}
              <a href={href(lang, "home", "liste-attente")}>liste d&apos;attente</a> pour être avisé.
            </>
          ),
        },
        {
          q: "Le forfait Gratuit est-il vraiment gratuit?",
          a: (
            <>
              Oui, 0 $ par mois, avec des publicités dans l&apos;app et des limites : {free.outboundMinutes} minutes sortantes,{" "}
              {free.inboundMinutes} minutes entrantes et {free.outboundSms} textos sortants par mois vers le Canada et les
              États-Unis. Le numéro est récupéré après {free.inactivityDays} jours sans activité; nous vous avisons avant.
            </>
          ),
        },
        {
          q: "Comment garder mon numéro si je l'utilise peu?",
          a: (
            <>
              Avec le forfait Verrouillage du numéro ({formatCad(PLANS.lock.monthlyPriceCents, lang)}/mois) ou Premium, votre
              numéro est conservé même sans activité.
            </>
          ),
        },
        {
          q: "MIMT remplace-t-il mon fournisseur cellulaire?",
          a: "Non. MIMT Mobile est une application qui utilise le Wi‑Fi ou vos données mobiles. Vous gardez votre forfait cellulaire actuel. Un service cellulaire MIMT est en préparation, sans date annoncée.",
        },
        {
          q: "Est-ce que ça fonctionne sans Wi‑Fi?",
          a: "Oui, avec vos données mobiles. Sans connexion Internet, l'app ne peut ni appeler ni texter. Les appels utilisent des données : vérifiez votre forfait de données, surtout en itinérance.",
        },
        {
          q: "Puis-je appeler le 9-1-1?",
          a: (
            <>
              Oui, mais avec des limites propres aux services par Internet. Vous devez enregistrer votre adresse avant votre premier
              appel et la garder à jour. <a href={href(lang, "e911")}>Lire la page 9-1-1</a>.
            </>
          ),
        },
        {
          q: "Puis-je transférer mon numéro actuel chez MIMT?",
          a: "Le transfert de numéro vers MIMT est prévu, mais pas confirmé pour le lancement. Si vous quittez MIMT, vous pourrez transférer votre numéro chez un autre fournisseur.",
        },
        {
          q: "Et les appels internationaux?",
          a: "Ils ne sont pas inclus dans les forfaits. Ils se paient d'avance avec un crédit international, au tarif affiché dans l'app. Ils ne sont pas offerts avec le forfait Gratuit.",
        },
        {
          q: "Les prix incluent-ils les taxes?",
          a: "Non. La TPS, la TVQ et la taxe municipale 9-1-1 du Québec s'ajoutent aux prix affichés.",
        },
        {
          q: "Comment annuler?",
          a: (
            <>
              Vous pourrez annuler dans l&apos;app ou en nous écrivant. Les détails seront dans nos{" "}
              <a href={href(lang, "terms")}>conditions</a>, que vous verrez avant tout paiement.
            </>
          ),
        },
        {
          q: "Que faites-vous de mes données?",
          a: (
            <>
              Nous recueillons le minimum pour fournir le service et ne vendons pas vos renseignements. Voir notre{" "}
              <a href={href(lang, "privacy")}>politique de confidentialité</a>.
            </>
          ),
        },
        {
          q: "J'ai un problème qui n'est pas réglé.",
          a: (
            <>
              Voyez notre <a href={href(lang, "complaints")}>processus de plaintes</a>. Si nous ne réglons pas votre plainte, vous
              pouvez vous adresser gratuitement au CPRST.
            </>
          ),
        },
      ]
    : [
        {
          q: "When will MIMT be available?",
          a: (
            <>
              MIMT is in preparation and not available yet. No date is announced. Join the{" "}
              <a href={href(lang, "home", "waitlist")}>waitlist</a> to hear first.
            </>
          ),
        },
        {
          q: "Is the Free plan really free?",
          a: (
            <>
              Yes, $0 per month, with in-app ads and limits: {free.outboundMinutes} outbound minutes, {free.inboundMinutes} inbound
              minutes and {free.outboundSms} outbound texts per month to Canada and the US. The number is reclaimed after{" "}
              {free.inactivityDays} days without activity; we warn you first.
            </>
          ),
        },
        {
          q: "How do I keep my number if I rarely use it?",
          a: (
            <>
              With Number Lock ({formatCad(PLANS.lock.monthlyPriceCents, lang)}/month) or Premium, your number is kept even when
              inactive.
            </>
          ),
        },
        {
          q: "Does MIMT replace my cell carrier?",
          a: "No. MIMT Mobile is an app that uses Wi‑Fi or your mobile data. You keep your current cell plan. A MIMT cellular service is in preparation, with no date announced.",
        },
        {
          q: "Does it work without Wi‑Fi?",
          a: "Yes, over mobile data. Without an internet connection, the app can't call or text. Calls use data: check your data plan, especially when roaming.",
        },
        {
          q: "Can I call 9-1-1?",
          a: (
            <>
              Yes, with limits that apply to internet services. You must register your address before your first call and keep it
              current. <a href={href(lang, "e911")}>Read the 9-1-1 page</a>.
            </>
          ),
        },
        {
          q: "Can I bring my current number to MIMT?",
          a: "Porting a number to MIMT is planned but not confirmed for launch. If you leave MIMT, you can port your number to another provider.",
        },
        {
          q: "What about international calls?",
          a: "They aren't included in plans. They're prepaid with international credit, at the rate shown in the app. They aren't available on the Free plan.",
        },
        {
          q: "Do prices include taxes?",
          a: "No. GST, QST and the Québec 9-1-1 municipal tax are added to the prices shown.",
        },
        {
          q: "How do I cancel?",
          a: (
            <>
              You'll be able to cancel in the app or by writing to us. Details will be in our <a href={href(lang, "terms")}>terms</a>,
              shown before any payment.
            </>
          ),
        },
        {
          q: "What do you do with my data?",
          a: (
            <>
              We collect the minimum needed to provide the service and don&apos;t sell your information. See our{" "}
              <a href={href(lang, "privacy")}>privacy policy</a>.
            </>
          ),
        },
        {
          q: "My problem isn't solved.",
          a: (
            <>
              See our <a href={href(lang, "complaints")}>complaints process</a>. If we don&apos;t resolve your complaint, you can
              go to the CCTS for free.
            </>
          ),
        },
      ];

  return (
    <Shell lang={lang} page="help">
      <PageHero
        eyebrow={fr ? "Aide" : "Help"}
        title={fr ? "Questions fréquentes" : "Frequently asked questions"}
        lead={fr ? "Des réponses courtes et honnêtes." : "Short, honest answers."}
      />
      <section className="section">
        <div className="container prose">
          <div className="faq">
            {faq.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <div className="faq__a">{typeof item.a === "string" ? <p>{item.a}</p> : <p>{item.a}</p>}</div>
              </details>
            ))}
          </div>
          <p className="mt-l">
            {fr ? "Vous ne trouvez pas votre réponse? " : "Can't find your answer? "}
            <a href={href(lang, "contact")}>{fr ? "Écrivez-nous" : "Write to us"}</a> ({CONTACT_EMAIL}).
          </p>
        </div>
      </section>
    </Shell>
  );
}
