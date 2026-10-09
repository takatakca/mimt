import { PrivacyPage } from "@/components/pages/PrivacyPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("en", "privacy", "Privacy", "MIMT privacy policy (Québec Law 25): information collected, providers, your rights and our privacy officer.");

export default function Page() {
  return <PrivacyPage lang="en" />;
}
