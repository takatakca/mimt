import { AccessibilityPage } from "@/components/pages/AccessibilityPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("fr", "accessibility", "Accessibilité", "Engagement de MIMT en accessibilité : WCAG 2.1 AA, services de relais, formats adaptés.");

export default function Page() {
  return <AccessibilityPage lang="fr" />;
}
