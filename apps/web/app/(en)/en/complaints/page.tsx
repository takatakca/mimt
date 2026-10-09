import { ComplaintsPage } from "@/components/pages/ComplaintsPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("en", "complaints", "Complaints", "How to make a complaint to MIMT and how to reach the CCTS if it isn't resolved.");

export default function Page() {
  return <ComplaintsPage lang="en" />;
}
