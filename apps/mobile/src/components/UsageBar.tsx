import { StyleSheet, Text, View } from "react-native";
import type { UsageRow } from "../lib/usage";
import { colors, radius, spacing, type } from "../theme";

export function UsageBar({ label, row, ofText }: { label: string; row: UsageRow; ofText: string }) {
  const fill = { ok: colors.electric, warn: colors.warning, full: colors.danger }[row.level];
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: row.percent, text: ofText }}
      style={{ marginVertical: spacing.sm }}
    >
      <View style={styles.head}>
        <Text style={type.body}>{label}</Text>
        <Text style={type.secondary}>{ofText}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${row.percent}%`, backgroundColor: fill }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: spacing.sm },
  track: { height: 10, borderRadius: radius.pill, backgroundColor: colors.midnightRaised, marginTop: spacing.xs, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radius.pill },
});
