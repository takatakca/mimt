import { AccessibilityPage } from "@/components/pages/AccessibilityPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("en", "accessibility", "Accessibility", "MIMT's accessibility commitment: WCAG 2.1 AA, relay services, alternative formats.");

export default function Page() {
  return <AccessibilityPage lang="en" />;
}
