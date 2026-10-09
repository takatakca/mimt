import { TermsPage } from "@/components/pages/TermsPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("en", "terms", "Terms of service", "Terms of service for MIMT.");

export default function Page() {
  return <TermsPage lang="en" />;
}
