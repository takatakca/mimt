"use client";

import { useId, useState, type FormEvent } from "react";
import { CONTACT_EMAIL, href, type Lang } from "@/lib/site";

export type FormKind = "waitlist" | "demo" | "contact";

type Field = {
  name: string;
  label: { fr: string; en: string };
  type?: "text" | "email" | "tel" | "number" | "textarea" | "select";
  required?: boolean;
  autoComplete?: string;
  options?: { value: string; fr: string; en: string }[];
};

const FIELDS: Record<FormKind, Field[]> = {
  waitlist: [
    { name: "email", label: { fr: "Courriel", en: "Email" }, type: "email", required: true, autoComplete: "email" },
    {
      name: "interest",
      label: { fr: "Ce qui vous intéresse", en: "What interests you" },
      type: "select",
      options: [
        { value: "mobile", fr: "MIMT Mobile (application)", en: "MIMT Mobile (app)" },
        { value: "business", fr: "MIMT Affaires", en: "MIMT Business" },
        { value: "home_phone", fr: "Téléphone résidentiel (bientôt)", en: "Home phone (coming soon)" },
        { value: "internet", fr: "Internet (bientôt)", en: "Internet (coming soon)" },
        { value: "cellular", fr: "Cellulaire (bientôt)", en: "Cellular (coming soon)" },
      ],
    },
  ],
  demo: [
    { name: "name", label: { fr: "Nom", en: "Name" }, required: true, autoComplete: "name" },
    { name: "company", label: { fr: "Entreprise", en: "Company" }, required: true, autoComplete: "organization" },
    { name: "email", label: { fr: "Courriel", en: "Email" }, type: "email", required: true, autoComplete: "email" },
    { name: "phone", label: { fr: "Téléphone (facultatif)", en: "Phone (optional)" }, type: "tel", autoComplete: "tel" },
    { name: "lines", label: { fr: "Nombre de lignes", en: "Number of lines" }, type: "number" },
    { name: "message", label: { fr: "Vos besoins (facultatif)", en: "Your needs (optional)" }, type: "textarea" },
  ],
  contact: [
    { name: "name", label: { fr: "Nom", en: "Name" }, required: true, autoComplete: "name" },
    { name: "email", label: { fr: "Courriel", en: "Email" }, type: "email", required: true, autoComplete: "email" },
    {
      name: "topic",
      label: { fr: "Sujet", en: "Topic" },
      type: "select",
      options: [
        { value: "question", fr: "Question générale", en: "General question" },
        { value: "business", fr: "MIMT Affaires", en: "MIMT Business" },
        { value: "privacy", fr: "Confidentialité", en: "Privacy" },
        { value: "accessibility", fr: "Accessibilité", en: "Accessibility" },
        { value: "complaint", fr: "Plainte", en: "Complaint" },
        { value: "media", fr: "Médias et partenariats", en: "Media and partnerships" },
      ],
    },
    { name: "message", label: { fr: "Message", en: "Message" }, type: "textarea", required: true },
  ],
};

const SUBJECTS: Record<FormKind, { fr: string; en: string }> = {
  waitlist: { fr: "Liste d'attente MIMT", en: "MIMT waitlist" },
  demo: { fr: "Demande de démo MIMT Affaires", en: "MIMT Business demo request" },
  contact: { fr: "Message depuis mimt.ca", en: "Message from mimt.ca" },
};

const ENDPOINT = process.env.NEXT_PUBLIC_FORMS_ENDPOINT || "";

type Status = { kind: "idle" | "sending" | "ok" | "mail" | "error"; message?: string };

export function LeadForm({
  kind,
  lang,
  submitLabel,
  defaults,
}: {
  kind: FormKind;
  lang: Lang;
  submitLabel?: string;
  defaults?: Record<string, string>;
}) {
  const uid = useId();
  const fr = lang === "fr";
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("website")) return; // honeypot: bots fill hidden fields
    const fields: Record<string, string> = {};
    for (const f of FIELDS[kind]) fields[f.name] = String(data.get(f.name) ?? "").trim();
    const marketingConsent = data.get("marketing") === "on";

    if (!ENDPOINT) {
      // No API yet: open the visitor's email app with the request pre-filled.
      const body = [
        ...FIELDS[kind].map((f) => `${f.label[lang]}: ${fields[f.name] || "-"}`),
        "",
        `${fr ? "Consentement aux communications marketing" : "Marketing communications consent"}: ${
          marketingConsent ? (fr ? "oui" : "yes") : fr ? "non" : "no"
        }`,
        `${fr ? "Langue" : "Language"}: ${fr ? "fr-CA" : "en-CA"}`,
      ].join("\n");
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(SUBJECTS[kind][lang])}&body=${encodeURIComponent(body)}`;
      setStatus({
        kind: "mail",
        message: fr
          ? `Votre application de courriel devrait s'ouvrir. Sinon, écrivez-nous à ${CONTACT_EMAIL}.`
          : `Your email app should open. If not, write to us at ${CONTACT_EMAIL}.`,
      });
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form: kind,
          locale: fr ? "fr-CA" : "en-CA",
          fields,
          consents: {
            // CASL: optional, separate from the request, unchecked by default.
            marketing: marketingConsent,
            marketingText: marketingText(lang),
          },
          page: window.location.pathname,
          submittedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus({
        kind: "ok",
        message:
          kind === "waitlist"
            ? fr
              ? "Merci! Vous êtes sur la liste. Nous vous écrirons au lancement."
              : "Thanks! You're on the list. We'll email you at launch."
            : fr
              ? "Merci! Nous vous répondrons sous peu."
              : "Thanks! We'll get back to you shortly.",
      });
    } catch {
      setStatus({
        kind: "error",
        message: fr
          ? `L'envoi n'a pas fonctionné. Réessayez ou écrivez-nous à ${CONTACT_EMAIL}.`
          : `Sending failed. Try again or write to us at ${CONTACT_EMAIL}.`,
      });
    }
  }

  const id = (n: string) => `${uid}-${n}`;

  return (
    <form className={`lead-form lead-form--${kind}`} onSubmit={onSubmit} noValidate={false}>
      <div className="lead-form__grid">
        {FIELDS[kind].map((f) => (
          <div key={f.name} className={`field${f.type === "textarea" ? " field--wide" : ""}`}>
            <label htmlFor={id(f.name)}>
              {f.label[lang]}
              {f.required ? (
                <span className="req" aria-hidden="true">
                  {" "}
                  *
                </span>
              ) : null}
            </label>
            {f.type === "textarea" ? (
              <textarea id={id(f.name)} name={f.name} rows={4} required={f.required} />
            ) : f.type === "select" ? (
              <select id={id(f.name)} name={f.name} defaultValue={defaults?.[f.name]}>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o[lang]}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id(f.name)}
                name={f.name}
                type={f.type ?? "text"}
                required={f.required}
                autoComplete={f.autoComplete}
                min={f.type === "number" ? 1 : undefined}
                inputMode={f.type === "number" ? "numeric" : undefined}
              />
            )}
          </div>
        ))}
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="check">
        <input id={id("marketing")} name="marketing" type="checkbox" defaultChecked={false} />
        <label htmlFor={id("marketing")}>{marketingText(lang)}</label>
      </div>

      <p className="form-note">
        {fr ? (
          <>
            Nous utilisons ces renseignements seulement pour répondre à votre demande. Voir notre{" "}
            <a href={href(lang, "privacy")}>politique de confidentialité</a>.
          </>
        ) : (
          <>
            We use this information only to answer your request. See our <a href={href(lang, "privacy")}>privacy policy</a>.
          </>
        )}
      </p>

      <button className="btn btn--primary" type="submit" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? (fr ? "Envoi…" : "Sending…") : (submitLabel ?? (fr ? "Envoyer" : "Send"))}
      </button>

      <p className={`form-status form-status--${status.kind}`} role="status" aria-live="polite">
        {status.message ?? ""}
      </p>
    </form>
  );
}

function marketingText(lang: Lang): string {
  return lang === "fr"
    ? "Facultatif : j'accepte de recevoir par courriel des nouvelles et des offres de MIMT (GROUPE TAKATAK, info@mimt.ca). Je peux me désabonner en tout temps."
    : "Optional: I agree to receive news and offers by email from MIMT (GROUPE TAKATAK, info@mimt.ca). I can unsubscribe at any time.";
}
