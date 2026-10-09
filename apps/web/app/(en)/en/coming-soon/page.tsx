import { SoonPage } from "@/components/pages/SoonPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("en", "soon", "Coming soon", "MIMT home phone, internet and cellular: in preparation. Join the waitlist.");

export default function Page() {
  return <SoonPage lang="en" />;
}
