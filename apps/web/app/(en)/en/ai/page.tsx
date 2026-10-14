import { AiPage } from "@/components/pages/AiPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("en", "ai", "Artificial intelligence", "Planned optional MIMT AI features based on user consent.");

export default function Page() {
  return <AiPage lang="en" />;
}
