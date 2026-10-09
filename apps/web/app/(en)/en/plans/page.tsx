import { PlansPage } from "@/components/pages/PlansPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("en", "plans", "Plans", "MIMT plans: Free, Number Lock, Premium, Business and Business Pro. Clear prices and limits shown up front.");

export default function Page() {
  return <PlansPage lang="en" />;
}
