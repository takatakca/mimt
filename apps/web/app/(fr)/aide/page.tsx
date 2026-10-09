import { HelpPage } from "@/components/pages/HelpPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("fr", "help", "Aide et FAQ", "Réponses aux questions fréquentes sur MIMT : forfait gratuit, numéro, 9-1-1, international, taxes, annulation.");

export default function Page() {
  return <HelpPage lang="fr" />;
}
