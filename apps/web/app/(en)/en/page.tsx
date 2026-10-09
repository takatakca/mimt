import { HomePage } from "@/components/pages/HomePage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("en", "home", "MIMT | Your Canadian number, anywhere", "A real Canadian number to call and text over Wi‑Fi or data. MIMT Mobile and MIMT Business, made in Québec. Join the waitlist.");

export default function Page() {
  return <HomePage lang="en" />;
}
