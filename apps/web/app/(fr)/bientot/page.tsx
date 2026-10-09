import { SoonPage } from "@/components/pages/SoonPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("fr", "soon", "Bientôt", "Téléphone résidentiel, Internet et cellulaire MIMT : en préparation. Inscrivez-vous à la liste d'attente.");

export default function Page() {
  return <SoonPage lang="fr" />;
}
