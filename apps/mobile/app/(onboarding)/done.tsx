import { useLocalSearchParams, useRouter } from "expo-router";
import { Body, Button, Screen, Title, Wordmark } from "../../src/components/ui";
import { useI18n } from "../../src/i18n";
import { formatPhone } from "../../src/lib/dial";

export default function Done() {
  const { t } = useI18n();
  const router = useRouter();
  const { number } = useLocalSearchParams<{ number?: string }>();
  return (
    <Screen>
      <Wordmark by={t("app.by")} />
      <Title>{t("done.title")}</Title>
      <Body>{t("done.body", { number: number ? formatPhone(number) : "" })}</Body>
      <Button label={t("done.go")} onPress={() => router.replace("/messages")} style={{ marginTop: 24 }} />
    </Screen>
  );
}
