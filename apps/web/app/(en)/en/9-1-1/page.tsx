import { E911Page } from "@/components/pages/E911Page";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("en", "e911", "9-1-1", "9-1-1 with an internet phone service: limits, keeping your address current and outages. Read before using MIMT.");

export default function Page() {
  return <E911Page lang="en" />;
}
