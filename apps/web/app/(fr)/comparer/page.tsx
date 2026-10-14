import { ComparePage } from "@/components/pages/ComparePage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("fr", "compare", "Comparer MIMT", "Comparer les forfaits MIMT aux modèles d'applications de numéro gratuit.");

export default function Page() {
  return <ComparePage lang="fr" />;
}
