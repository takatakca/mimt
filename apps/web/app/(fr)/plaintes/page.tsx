import { ComplaintsPage } from "@/components/pages/ComplaintsPage";
import { pageMeta } from "@/lib/site";

export const metadata = pageMeta("fr", "complaints", "Plaintes", "Comment déposer une plainte auprès de MIMT et comment joindre le CPRST si elle n'est pas réglée.");

export default function Page() {
  return <ComplaintsPage lang="fr" />;
}
