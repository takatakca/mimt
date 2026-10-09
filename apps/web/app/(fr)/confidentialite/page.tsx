import { PrivacyPage } from "@/components/pages/PrivacyPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("fr", "privacy", "Confidentialité", "Politique de confidentialité de MIMT (Loi 25) : renseignements recueillis, fournisseurs, vos droits et notre responsable.");

export default function Page() {
  return <PrivacyPage lang="fr" />;
}
