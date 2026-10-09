import { ContactPage } from "@/components/pages/ContactPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("en", "contact", "Contact", "Write to MIMT: questions, MIMT Business, partnerships.");

export default function Page() {
  return <ContactPage lang="en" />;
}
