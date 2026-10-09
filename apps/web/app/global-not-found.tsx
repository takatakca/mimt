import type { Metadata } from "next";
import { inter, montserrat } from "@/lib/fonts";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Page introuvable | Page not found — MIMT",
  robots: { index: false },
  icons: { icon: "/favicon.svg" },
};

export default function GlobalNotFound() {
  return (
    <html lang="fr-CA" className={`${montserrat.variable} ${inter.variable}`}>
      <body>
        <main className="hero notfound">
          <div className="container">
            <p className="eyebrow">404</p>
            <h1>Page introuvable</h1>
            <p className="lead">Cette page n&apos;existe pas ou a été déplacée.</p>
            <p>
              <a className="btn btn--primary" href="/">
                Retour à l&apos;accueil
              </a>
            </p>
            <div lang="en-CA" className="notfound__en">
              <h2>Page not found</h2>
              <p className="lead">This page doesn&apos;t exist or has moved.</p>
              <p>
                <a className="btn btn--ghost" href="/en/">
                  Back to home
                </a>
              </p>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
