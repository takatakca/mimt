import { AiPage } from "@/components/pages/AiPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("fr", "ai", "Intelligence artificielle", "Fonctions IA MIMT prévues, facultatives et fondées sur le consentement.");

export default function Page() {
  return <AiPage lang="fr" />;
}
