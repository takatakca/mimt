import { ContactPage } from "@/components/pages/ContactPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("fr", "contact", "Contact", "Écrivez à MIMT : questions, MIMT Affaires, partenariats.");

export default function Page() {
  return <ContactPage lang="fr" />;
}
