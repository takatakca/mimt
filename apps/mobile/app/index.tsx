import { Redirect } from "expo-router";
import { useSession } from "../src/auth/session";
import { Loading, Screen } from "../src/components/ui";
import { useI18n } from "../src/i18n";
import { nextOnboardingStep } from "../src/lib/onboarding";

/** Entry: route to onboarding, the next missing onboarding step, or the main tabs. */
export default function Index() {
  const { t } = useI18n();
  const { status, me } = useSession();
  if (status === "loading") {
    return (
      <Screen scroll={false}>
        <Loading label={t("common.loading")} />
      </Screen>
    );
  }
  if (status === "signedOut") return <Redirect href="/welcome" />;
  const step = me ? nextOnboardingStep(me) : null;
  if (step === "address") return <Redirect href="/address" />;
  if (step === "notice") return <Redirect href="/notice" />;
  if (step === "number") return <Redirect href="/number" />;
  return <Redirect href="/messages" />;
}
