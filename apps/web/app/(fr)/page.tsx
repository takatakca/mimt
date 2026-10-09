import { HomePage } from "@/components/pages/HomePage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("fr", "home", "MIMT | Votre numéro canadien, partout", "Un vrai numéro canadien pour appeler et texter par Wi‑Fi ou données. MIMT Mobile et MIMT Affaires, fait au Québec. Inscrivez-vous à la liste d'attente.");

export default function Page() {
  return <HomePage lang="fr" />;
}
