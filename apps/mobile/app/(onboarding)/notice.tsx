import { useRouter } from "expo-router";
import { useSession } from "../../src/auth/session";
import { E911NoticeView } from "../../src/components/E911NoticeView";
import { Screen } from "../../src/components/ui";

export default function OnboardingNotice() {
  const router = useRouter();
  const { refreshMe } = useSession();
  return (
    <Screen>
      <E911NoticeView
        requireAck
        onAccepted={async () => {
          const me = await refreshMe();
          router.replace(me && me.numbers.length > 0 ? "/" : "/number");
        }}
      />
    </Screen>
  );
}
