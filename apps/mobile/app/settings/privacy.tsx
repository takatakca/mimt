import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Switch, View } from "react-native";
import { api } from "../../src/api/client";
import { toErrorKey } from "../../src/api/errors";
import { Body, Card, ErrorText, Notice, Row, Screen } from "../../src/components/ui";
import { useI18n, type TKey } from "../../src/i18n";
import { getPersonalisedConsent, setPersonalisedConsent, showAdPrivacyOptions } from "../../src/services/ads";
import { colors, spacing } from "../../src/theme";

const CONSENT_VERSION = "2026-10";
const PRIVACY_URL = { fr: "https://mimt.ca/confidentialite", en: "https://mimt.ca/en/privacy" };

export default function Privacy() {
  const { t, lang } = useI18n();
  const [ads, setAds] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorKey, setErrorKey] = useState<TKey | null>(null);

  useEffect(() => {
    getPersonalisedConsent().then(setAds);
    // TODO(api): read the current consents from GET /v1/consents once it exists.
  }, []);

  async function save(kind: "ads_personalised" | "casl_marketing", granted: boolean) {
    setSaved(false);
    setErrorKey(null);
    try {
      await api.setConsent({ kind, granted, version: CONSENT_VERSION, source: "mobile" });
      if (kind === "ads_personalised") await setPersonalisedConsent(granted);
      setSaved(true);
    } catch (e) {
      setErrorKey(toErrorKey(e));
      if (kind === "ads_personalised") setAds(!granted);
      else setMarketing(!granted);
    }
  }

  return (
    <Screen edges={["bottom"]}>
      <Stack.Screen options={{ title: t("privacy.title"), headerBackTitle: t("common.back") }} />
      <Body muted>{t("privacy.intro")}</Body>
      <Card>
        <Row
          title={t("privacy.adsPersonalised")}
          subtitle={t("privacy.adsPersonalisedHint")}
          right={
            <Switch
              accessibilityLabel={t("privacy.adsPersonalised")}
              value={ads}
              trackColor={{ true: colors.electric, false: colors.midnightRaised }}
              onValueChange={(v) => {
                setAds(v);
                save("ads_personalised", v);
              }}
            />
          }
        />
        <Row
          title={t("privacy.marketing")}
          subtitle={t("privacy.marketingHint")}
          right={
            <Switch
              accessibilityLabel={t("privacy.marketing")}
              value={marketing}
              trackColor={{ true: colors.electric, false: colors.midnightRaised }}
              onValueChange={(v) => {
                setMarketing(v);
                save("casl_marketing", v);
              }}
            />
          }
        />
      </Card>
      {saved ? <Notice tone="success">{t("privacy.saved")}</Notice> : null}
      {errorKey ? <ErrorText>{t(errorKey)}</ErrorText> : null}
      <View style={{ marginTop: spacing.md }}>
        <Card>
          <Row icon="options" title={t("privacy.adChoices")} onPress={showAdPrivacyOptions} />
          <Row icon="document-text" title={t("privacy.policy")} onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL[lang])} />
        </Card>
      </View>
    </Screen>
  );
}
