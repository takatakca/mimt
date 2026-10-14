import { ComparePage } from "@/components/pages/ComparePage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("en", "compare", "Compare MIMT", "Compare MIMT plans with free-number app service models.");

export default function Page() {
  return <ComparePage lang="en" />;
}
