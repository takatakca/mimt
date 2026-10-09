import { useRouter } from "expo-router";
import { useSession } from "../../src/auth/session";
import { AddressForm } from "../../src/components/AddressForm";
import { Body, Screen, Title } from "../../src/components/ui";
import { useI18n } from "../../src/i18n";

export default function OnboardingAddress() {
  const { t } = useI18n();
  const router = useRouter();
  const { refreshMe } = useSession();
  return (
    <Screen>
      <Title>{t("address.title")}</Title>
      <Body muted>{t("address.intro")}</Body>
      <AddressForm
        onSaved={async () => {
          await refreshMe();
          router.replace("/notice");
        }}
      />
    </Screen>
  );
}
