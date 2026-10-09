import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { colors } from "../theme";
import type { IconName } from "./ui";

/** Round icon button for the dial pad and the in-call controls (always labelled for screen readers). */
export function RoundButton({
  icon,
  label,
  onPress,
  color = colors.midnightRaised,
  big,
  active,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
  big?: boolean;
  active?: boolean;
}) {
  const size = big ? 80 : 60;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={active !== undefined ? { selected: active } : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size / 2, backgroundColor: active ? colors.white : color },
        styles.round,
        pressed && { opacity: 0.75 },
      ]}
    >
      <Ionicons name={icon} size={big ? 36 : 26} color={active ? colors.navy : colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  round: { alignItems: "center", justifyContent: "center" },
});
