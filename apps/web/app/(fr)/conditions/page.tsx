import { TermsPage } from "@/components/pages/TermsPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("fr", "terms", "Conditions d'utilisation", "Conditions d'utilisation du service MIMT.");

export default function Page() {
  return <TermsPage lang="fr" />;
}
