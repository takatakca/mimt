import type { ReactNode } from "react";
import { LABELS, MAIN_NAV, ROUTES, href, type Lang, type RouteKey } from "@/lib/site";

function Wordmark({ lang }: { lang: Lang }) {
  return (
    <a className="wordmark" href={href(lang, "home")} aria-label={lang === "fr" ? "MIMT, accueil" : "MIMT, home"}>
      <span className="wordmark__name" aria-hidden="true">
        MIMT
      </span>
      <span className="wordmark__by" aria-hidden="true">
        {lang === "fr" ? "par GROUPE TAKATAK" : "by GROUPE TAKATAK"}
      </span>
    </a>
  );
}

function LangSwitch({ lang, page }: { lang: Lang; page: RouteKey }) {
  const other: Lang = lang === "fr" ? "en" : "fr";
  return (
    <a
      className="langswitch"
      href={ROUTES[page][other]}
      hrefLang={other === "fr" ? "fr-CA" : "en-CA"}
      lang={other === "fr" ? "fr-CA" : "en-CA"}
    >
      <span aria-hidden="true">{other.toUpperCase()}</span>
      <span className="sr-only">{other === "fr" ? "Version française" : "English version"}</span>
    </a>
  );
}

function NavLinks({ lang, page }: { lang: Lang; page: RouteKey }) {
  return (
    <ul>
      {MAIN_NAV.map((key) => (
        <li key={key}>
          <a href={href(lang, key)} aria-current={key === page ? "page" : undefined}>
            {LABELS[key][lang]}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Header({ lang, page }: { lang: Lang; page: RouteKey }) {
  const fr = lang === "fr";
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Wordmark lang={lang} />
        <nav className="nav-desktop" aria-label={fr ? "Navigation principale" : "Main navigation"}>
          <NavLinks lang={lang} page={page} />
        </nav>
        <div className="site-header__actions">
          <LangSwitch lang={lang} page={page} />
          <a className="btn btn--primary btn--sm hide-sm" href={href(lang, "home", fr ? "liste-attente" : "waitlist")}>
            {fr ? "Liste d'attente" : "Join the waitlist"}
          </a>
          <details className="nav-mobile">
            <summary aria-label={fr ? "Menu" : "Menu"}>
              <span className="burger" aria-hidden="true" />
              <span className="nav-mobile__label">Menu</span>
            </summary>
            <nav aria-label={fr ? "Navigation mobile" : "Mobile navigation"}>
              <NavLinks lang={lang} page={page} />
              <a className="btn btn--primary" href={href(lang, "home", fr ? "liste-attente" : "waitlist")}>
                {fr ? "Rejoindre la liste d'attente" : "Join the waitlist"}
              </a>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

function Footer({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  const year = new Date().getFullYear();
  const cols: { title: string; keys: RouteKey[] }[] = [
    { title: fr ? "Produits" : "Products", keys: ["home", "plans", "business", "soon"] },
    { title: fr ? "Soutien" : "Support", keys: ["help", "contact", "complaints", "e911"] },
    { title: fr ? "Légal" : "Legal", keys: ["privacy", "terms", "accessibility"] },
  ];
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Wordmark lang={lang} />
            <p>
              {fr
                ? "Mobile Innovation Modern Telecommunications. Votre numéro canadien, partout."
                : "Mobile Innovation Modern Telecommunications. Your Canadian number, anywhere."}
            </p>
            <p className="site-footer__911">
              {fr ? (
                <>
                  Le 9-1-1 par Internet a des limites. <a href={href(lang, "e911")}>À lire avant d'utiliser MIMT</a>.
                </>
              ) : (
                <>
                  9-1-1 over the internet has limits. <a href={href(lang, "e911")}>Read this before using MIMT</a>.
                </>
              )}
            </p>
          </div>
          {cols.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="site-footer__title">{col.title}</h2>
              <ul>
                {col.keys.map((key) => (
                  <li key={key}>
                    <a href={href(lang, key)}>{key === "home" ? "MIMT Mobile" : LABELS[key][lang]}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="site-footer__bottom">
          <p>
            {fr ? "Un membre de l'écosystème GROUPE TAKATAK — " : "A member of the GROUPE TAKATAK ecosystem — "}
            <a href="https://takatak.ca" rel="noopener">
              takatak.ca
            </a>
            <span className="site-footer__tagline"> · Digital Solutions. Real Results.</span>
          </p>
          <p>
            © {year} MIMT. {fr ? "Tous droits réservés." : "All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}

export function Shell({ lang, page, children }: { lang: Lang; page: RouteKey; children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenu">
        {lang === "fr" ? "Aller au contenu" : "Skip to content"}
      </a>
      <Header lang={lang} page={page} />
      <main id="contenu" tabIndex={-1}>
        {children}
      </main>
      <Footer lang={lang} />
    </>
  );
}

/** Dark page header used on inner pages. */
export function PageHero({ eyebrow, title, lead }: { eyebrow?: string; title: string; lead?: ReactNode }) {
  return (
    <section className="page-hero">
      <div className="container">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {lead ? <p className="lead">{lead}</p> : null}
      </div>
    </section>
  );
}
