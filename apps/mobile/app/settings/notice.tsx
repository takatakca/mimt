import { Stack } from "expo-router";
import { E911NoticeView } from "../../src/components/E911NoticeView";
import { Screen } from "../../src/components/ui";
import { useI18n } from "../../src/i18n";
import { useSession } from "../../src/auth/session";

export default function SettingsNotice() {
  const { t } = useI18n();
  const { me, refreshMe } = useSession();
  // If a new notice version was published, the user must accept it again.
  const needsAck = !!me && !me.e911.noticeAccepted;
  return (
    <Screen edges={["bottom"]}>
      <Stack.Screen options={{ title: t("notice.title"), headerBackTitle: t("common.back") }} />
      <E911NoticeView requireAck={needsAck} onAccepted={() => refreshMe()} />
    </Screen>
  );
}
