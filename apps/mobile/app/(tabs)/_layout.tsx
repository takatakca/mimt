import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { useSession } from "../../src/auth/session";
import type { IconName } from "../../src/components/ui";
import { useI18n } from "../../src/i18n";
import { colors } from "../../src/theme";

function icon(name: IconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} color={color} size={size} />;
}

export default function TabsLayout() {
  const { t } = useI18n();
  const { status } = useSession();
  if (status === "signedOut") return <Redirect href="/welcome" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.electric,
        tabBarInactiveTintColor: colors.silver,
        tabBarStyle: { backgroundColor: colors.midnight, borderTopColor: colors.border, minHeight: 64 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        sceneStyle: { backgroundColor: colors.navy },
      }}
    >
      <Tabs.Screen name="messages" options={{ title: t("tabs.messages"), tabBarIcon: icon("chatbubbles") }} />
      <Tabs.Screen name="calls" options={{ title: t("tabs.calls"), tabBarIcon: icon("call") }} />
      <Tabs.Screen
        name="voicemail"
        options={{ title: t("tabs.voicemailShort"), tabBarAccessibilityLabel: t("tabs.voicemail"), tabBarIcon: icon("recording") }}
      />
      <Tabs.Screen name="contacts" options={{ title: t("tabs.contacts"), tabBarIcon: icon("people") }} />
      <Tabs.Screen name="account" options={{ title: t("tabs.account"), tabBarIcon: icon("person-circle") }} />
    </Tabs>
  );
}
