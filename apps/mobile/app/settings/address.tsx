import { Stack, useRouter } from "expo-router";
import { useSession } from "../../src/auth/session";
import { AddressForm } from "../../src/components/AddressForm";
import { Body, Screen } from "../../src/components/ui";
import { useI18n } from "../../src/i18n";

export default function SettingsAddress() {
  const { t } = useI18n();
  const router = useRouter();
  const { refreshMe } = useSession();
  return (
    <Screen edges={["bottom"]}>
      <Stack.Screen options={{ title: t("address.title"), headerBackTitle: t("common.back") }} />
      <Body muted>{t("address.intro")}</Body>
      <AddressForm
        onSaved={async () => {
          await refreshMe();
          router.back();
        }}
      />
    </Screen>
  );
}
