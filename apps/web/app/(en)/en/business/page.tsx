import { BusinessPage } from "@/components/pages/BusinessPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("en", "business", "MIMT Business", "Per-line business phone: extensions, auto-attendant, ring groups, mobile and desktop apps. Request a demo.");

export default function Page() {
  return <BusinessPage lang="en" />;
}
