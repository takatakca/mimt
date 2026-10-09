import { Pressable, StyleSheet, Text, View } from "react-native";
import { useI18n } from "../i18n";
import { colors, spacing } from "../theme";

const KEYS: [string, string][] = [
  ["1", ""], ["2", "ABC"], ["3", "DEF"],
  ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
  ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"],
  ["*", ""], ["0", "+"], ["#", ""],
];

/** Big-key dial pad. Long-press 0 types "+". */
export function DialPad({ onKey, compact }: { onKey: (key: string) => void; compact?: boolean }) {
  const { t } = useI18n();
  const size = compact ? 64 : 78;
  return (
    <View style={styles.grid}>
      {KEYS.map(([digit, letters]) => (
        <Pressable
          key={digit}
          accessibilityRole="button"
          accessibilityLabel={t("calls.key", { key: digit })}
          onPress={() => onKey(digit)}
          onLongPress={digit === "0" ? () => onKey("+") : undefined}
          style={({ pressed }) => [
            styles.key,
            { width: size, height: size, borderRadius: size / 2 },
            pressed && { backgroundColor: colors.brandBlue },
          ]}
        >
          <Text style={styles.digit} allowFontScaling={false}>
            {digit}
          </Text>
          {letters ? (
            <Text style={styles.letters} allowFontScaling={false}>
              {letters}
            </Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.md,
    width: "100%",
    maxWidth: 300,
    alignSelf: "center",
  },
  key: { backgroundColor: colors.midnightRaised, alignItems: "center", justifyContent: "center" },
  digit: { color: colors.white, fontSize: 30, fontWeight: "600" },
  letters: { color: colors.silver, fontSize: 11, letterSpacing: 2 },
});
