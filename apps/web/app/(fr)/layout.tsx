import type { ReactNode } from "react";
import { RootHtml } from "@/lib/root-layout";

export { viewport } from "@/lib/root-layout";

// French is the default language of the site (Charter of the French language).
export default function FrenchLayout({ children }: { children: ReactNode }) {
  return <RootHtml lang="fr-CA">{children}</RootHtml>;
}
