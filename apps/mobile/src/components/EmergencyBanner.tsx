import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useI18n } from "../i18n";
import { colors, radius, spacing } from "../theme";

/** Shown whenever 9-1-1 is being dialled or is in progress. Red is used here as a status colour. */
export function EmergencyBanner() {
  const { t } = useI18n();
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.banner}>
      <Ionicons name="warning" size={28} color={colors.white} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{t("call.emergencyBanner")}</Text>
        <Text style={styles.hint}>{t("call.emergencyHint")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  title: { color: colors.white, fontSize: 18, fontWeight: "800" },
  hint: { color: colors.white, fontSize: 14, marginTop: 2 },
});
