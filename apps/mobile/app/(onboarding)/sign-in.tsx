import { useRouter } from "expo-router";
import { useSession } from "../../src/auth/session";
import { takatakConfigured, useTakatakSignIn } from "../../src/auth/takatak";
import { Body, Button, ErrorText, Screen, Title, Wordmark } from "../../src/components/ui";
import { useI18n } from "../../src/i18n";

export default function SignIn() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { signIn } = useSession();
  const takatak = useTakatakSignIn(locale, async (tokens) => {
    await signIn(tokens);
    router.replace("/");
  });

  return (
    <Screen>
      <Wordmark by={t("app.by")} />
      <Title>{t("signin.title")}</Title>
      <Button
        icon="log-in"
        label={t("signin.takatak")}
        hint={t("signin.takatakHint")}
        onPress={takatak.start}
        loading={takatak.busy}
        disabled={takatakConfigured && !takatak.ready}
      />
      <Button variant="secondary" icon="chatbubble-ellipses" label={t("signin.sms")} onPress={() => router.push("/sms")} />
      {takatak.errorKey ? <ErrorText>{t(takatak.errorKey)}</ErrorText> : null}
      <Body muted style={{ marginTop: 16 }}>
        {t("signin.terms")}
      </Body>
    </Screen>
  );
}
