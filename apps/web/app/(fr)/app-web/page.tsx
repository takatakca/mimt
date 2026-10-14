import { WebAppPage } from "@/components/pages/WebAppPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("fr", "webapp", "Application Web", "App MIMT sur ordinateur : appels, messages et portail d'affaires prévus.");

export default function Page() {
  return <WebAppPage lang="fr" />;
}
