import { BusinessPage } from "@/components/pages/BusinessPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("fr", "business", "MIMT Affaires", "Téléphonie d'affaires par ligne : postes, réceptionniste automatique, groupes de sonnerie, applications mobile et ordinateur. Demandez une démo.");

export default function Page() {
  return <BusinessPage lang="fr" />;
}
