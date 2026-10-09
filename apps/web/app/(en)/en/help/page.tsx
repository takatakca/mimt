import { HelpPage } from "@/components/pages/HelpPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("en", "help", "Help and FAQ", "Answers to common questions about MIMT: free plan, number, 9-1-1, international, taxes, cancellation.");

export default function Page() {
  return <HelpPage lang="en" />;
}
