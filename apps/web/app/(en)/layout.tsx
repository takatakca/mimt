import type { ReactNode } from "react";
import { RootHtml } from "@/lib/root-layout";

export { viewport } from "@/lib/root-layout";

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <RootHtml lang="en-CA">{children}</RootHtml>;
}
