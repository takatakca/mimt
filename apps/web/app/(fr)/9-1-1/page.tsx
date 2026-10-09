import { E911Page } from "@/components/pages/E911Page";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("fr", "e911", "9-1-1", "Le 9-1-1 avec un service téléphonique par Internet : limites, adresse à jour et pannes. À lire avant d'utiliser MIMT.");

export default function Page() {
  return <E911Page lang="fr" />;
}
