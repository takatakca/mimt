import { useRouter } from "expo-router";
import { useState } from "react";
import { api } from "../../src/api/client";
import { ApiClientError, toErrorKey } from "../../src/api/errors";
import { useSession } from "../../src/auth/session";
import { Body, Button, ErrorText, Field, Screen, Title } from "../../src/components/ui";
import { useI18n, type TKey } from "../../src/i18n";
import { formatPhone, toDialable } from "../../src/lib/dial";

/** Fallback sign-in by SMS code (/v1/auth/otp/start|verify). */
export default function SmsSignIn() {
  const { t } = useI18n();
  const router = useRouter();
  const { signIn } = useSession();
  const [phone, setPhone] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<TKey | null>(null);

  async function send() {
    const e164 = toDialable(phone);
    if (!e164 || e164 === "911") return setErrorKey("otp.invalidPhone");
    setBusy(true);
    setErrorKey(null);
    try {
      await api.otpStart(e164);
      setSentTo(e164);
    } catch (e) {
      setErrorKey(toErrorKey(e));
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!sentTo) return;
    setBusy(true);
    setErrorKey(null);
    try {
      const tokens = await api.otpVerify(sentTo, code.trim());
      await signIn(tokens);
      router.replace("/");
    } catch (e) {
      // The API answers 401 for a wrong or expired code: that is not an expired session.
      setErrorKey(e instanceof ApiClientError && e.status === 401 ? "error.invalidCode" : toErrorKey(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>{t("otp.title")}</Title>
      {!sentTo ? (
        <>
          <Field
            label={t("otp.phoneLabel")}
            placeholder={t("otp.phonePlaceholder")}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
          />
          <Button label={t("otp.send")} onPress={send} loading={busy} />
        </>
      ) : (
        <>
          <Body muted>{t("otp.sentTo", { phone: formatPhone(sentTo) })}</Body>
          <Field
            label={t("otp.codeLabel")}
            placeholder={t("otp.codePlaceholder")}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoComplete="sms-otp"
            textContentType="oneTimeCode"
            maxLength={8}
          />
          <Button label={t("otp.verify")} onPress={verify} loading={busy} disabled={code.trim().length < 4} />
          <Button variant="ghost" label={t("otp.resend")} onPress={send} disabled={busy} />
        </>
      )}
      {errorKey ? <ErrorText>{t(errorKey)}</ErrorText> : null}
    </Screen>
  );
}
