import { useState } from "react";
import { View } from "react-native";
import { api } from "../api/client";
import { toErrorKey } from "../api/errors";
import { useI18n, type TKey } from "../i18n";
import { useAsync } from "../lib/useAsync";
import { spacing } from "../theme";
import { Body, Button, Card, Checkbox, ErrorText, Label, Loading, Title } from "./ui";

/**
 * 9-1-1 limitations notice from GET /v1/e911/notice (versioned, French first). With requireAck,
 * the user must tick "J'ai lu et j'accepte" before POST /v1/e911/acknowledge (CRTC 2005-21 / 2005-61).
 * The API returns both languages; the app shows the one matching its locale.
 */
export function E911NoticeView({ requireAck, onAccepted }: { requireAck?: boolean; onAccepted?: () => void }) {
  const { t, locale, lang } = useI18n();
  const notice = useAsync(() => api.e911Notice(locale), [locale]);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<TKey | null>(null);

  async function accept() {
    if (!notice.data) return;
    if (!checked) return setErrorKey("notice.mustAccept");
    setBusy(true);
    setErrorKey(null);
    try {
      // The app version is sent in the X-App-Version header on every request.
      await api.e911Ack({ noticeVersion: notice.data.version });
      onAccepted?.();
    } catch (e) {
      setErrorKey(toErrorKey(e));
    } finally {
      setBusy(false);
    }
  }

  if (notice.loading && !notice.data) return <Loading label={t("common.loading")} />;
  if (!notice.data) {
    return (
      <View>
        <Title>{t("notice.title")}</Title>
        <ErrorText>{t("notice.loadError")}</ErrorText>
        {notice.errorKey ? <ErrorText>{t(notice.errorKey)}</ErrorText> : null}
        <Button label={t("common.retry")} onPress={notice.reload} />
      </View>
    );
  }

  const text = notice.data[lang];
  return (
    <View>
      <Title>{text.title || t("notice.title")}</Title>
      {requireAck ? <Body muted>{t("notice.intro")}</Body> : null}
      <Card>
        {text.paragraphs.map((p, i) => (
          <Body key={i} style={{ marginBottom: spacing.sm }}>
            {p.trim()}
          </Body>
        ))}
        <Label>{t("notice.version", { version: notice.data.version })}</Label>
      </Card>
      {requireAck ? (
        <>
          <Checkbox checked={checked} onChange={setChecked} label={t("notice.accept")} />
          {errorKey ? <ErrorText>{t(errorKey)}</ErrorText> : null}
          <Button label={t("common.continue")} onPress={accept} loading={busy} disabled={!checked} />
        </>
      ) : null}
    </View>
  );
}
