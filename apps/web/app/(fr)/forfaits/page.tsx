import { PlansPage } from "@/components/pages/PlansPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("fr", "plans", "Forfaits", "Forfaits MIMT : Gratuit, Verrouillage du numéro, Premium, Affaires et Affaires Pro. Prix clairs et limites affichées.");

export default function Page() {
  return <PlansPage lang="fr" />;
}
