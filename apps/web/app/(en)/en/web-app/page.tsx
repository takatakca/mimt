import { WebAppPage } from "@/components/pages/WebAppPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("en", "webapp", "Web app", "MIMT desktop browser app: planned calling, texts and business portal.");

export default function Page() {
  return <WebAppPage lang="en" />;
}
