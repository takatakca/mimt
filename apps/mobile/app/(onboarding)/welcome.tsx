import { useRouter } from "expo-router";
import { View } from "react-native";
import { Body, Button, Notice, Screen, Title, Wordmark } from "../../src/components/ui";
import { useI18n } from "../../src/i18n";
import { spacing } from "../../src/theme";

export default function Welcome() {
  const { t, lang, setLang } = useI18n();
  const router = useRouter();
  return (
    <Screen>
      <Wordmark by={t("app.by")} />
      <Title>{t("welcome.title")}</Title>
      <Body muted>{t("welcome.body")}</Body>
      {/* 9-1-1 limitations are disclosed before sign-up (CRTC 2005-21). */}
      <Notice tone="warning">{t("welcome.e911")}</Notice>
      <View style={{ marginTop: spacing.lg }}>
        <Button label={t("welcome.start")} onPress={() => router.push("/sign-in")} />
        <Button
          variant="ghost"
          label={lang === "fr" ? t("account.languageEn") : t("account.languageFr")}
          onPress={() => setLang(lang === "fr" ? "en" : "fr")}
        />
      </View>
    </Screen>
  );
}
