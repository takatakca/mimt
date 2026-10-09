import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { DialPad } from "../src/components/DialPad";
import { EmergencyBanner } from "../src/components/EmergencyBanner";
import { RoundButton } from "../src/components/RoundButton";
import { Screen } from "../src/components/ui";
import { useI18n, type TKey } from "../src/i18n";
import { formatPhone } from "../src/lib/dial";
import { formatDuration } from "../src/lib/format";
import { callService, useCallState, type CallStatus } from "../src/services/call";
import { colors, spacing } from "../src/theme";

const STATUS_KEY: Record<CallStatus, TKey> = {
  idle: "call.ended",
  incoming: "call.incoming",
  connecting: "call.connecting",
  ringing: "call.ringing",
  connected: "call.connected",
  reconnecting: "call.reconnecting",
  ended: "call.ended",
  failed: "call.failed",
};

/** Full-screen active / incoming call. CallKit (iOS) and ConnectionService (Android) show their own UI too. */
export default function ActiveCall() {
  const { t } = useI18n();
  const router = useRouter();
  const call = useCallState();
  const [keypad, setKeypad] = useState(false);
  const [digits, setDigits] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (call.status === "idle" && router.canGoBack()) router.back();
  }, [call.status, router]);

  const live = call.status === "connected" || call.status === "reconnecting";
  const elapsed = call.connectedAt ? formatDuration((now - call.connectedAt) / 1000) : null;

  return (
    <Screen scroll={false}>
      <View style={styles.wrap}>
        {call.emergency ? <EmergencyBanner /> : null}
        <View style={styles.who} accessible accessibilityLiveRegion="polite">
          <Text style={styles.peer} numberOfLines={1} adjustsFontSizeToFit>
            {call.peer ? formatPhone(call.peer) : ""}
          </Text>
          <Text style={styles.status}>
            {t(STATUS_KEY[call.status])}
            {live && elapsed ? ` · ${elapsed}` : ""}
          </Text>
          {!call.available && call.status === "failed" ? <Text style={styles.status}>{t("call.devBuildOnly")}</Text> : null}
          {keypad ? <Text style={styles.digits}>{digits}</Text> : null}
        </View>

        {call.status === "incoming" ? (
          <View style={styles.incoming}>
            <RoundButton big icon="close" color={colors.danger} label={t("call.reject")} onPress={() => callService.reject()} />
            <RoundButton big icon="call" color={colors.success} label={t("call.accept")} onPress={() => callService.accept()} />
          </View>
        ) : (
          <>
            {keypad ? (
              <DialPad
                compact
                onKey={(k) => {
                  if (k === "+") return;
                  setDigits((d) => d + k);
                  callService.sendDigits(k);
                }}
              />
            ) : (
              <View style={styles.controls}>
                <Control icon={call.muted ? "mic-off" : "mic"} active={call.muted} label={call.muted ? t("call.unmute") : t("call.mute")} onPress={() => callService.toggleMute()} />
                <Control icon="keypad" label={t("call.keypad")} onPress={() => setKeypad(true)} />
                <Control icon="volume-high" active={call.speaker} label={t("call.speaker")} onPress={() => callService.toggleSpeaker()} />
                <Control icon={call.onHold ? "play" : "pause"} active={call.onHold} label={call.onHold ? t("call.resume") : t("call.hold")} onPress={() => callService.toggleHold()} />
              </View>
            )}
            <View style={styles.bottom}>
              {keypad ? <RoundButton icon="chevron-down" label={t("call.hideKeypad")} onPress={() => setKeypad(false)} /> : <View style={{ width: 60 }} />}
              <RoundButton
                big
                icon="call"
                color={colors.danger}
                label={call.status === "ended" || call.status === "failed" ? t("common.close") : t("call.hangup")}
                onPress={async () => {
                  await callService.hangup();
                  if (router.canGoBack()) router.back();
                }}
              />
              <View style={{ width: 60 }} />
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

function Control(props: { icon: React.ComponentProps<typeof RoundButton>["icon"]; label: string; onPress: () => void; active?: boolean }) {
  return (
    <View style={styles.control}>
      <RoundButton icon={props.icon} label={props.label} onPress={props.onPress} active={!!props.active} />
      <Text style={styles.controlLabel} importantForAccessibility="no" accessibilityElementsHidden>
        {props.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: spacing.md, justifyContent: "space-between" },
  who: { alignItems: "center", marginTop: spacing.xl },
  peer: { color: colors.white, fontSize: 36, fontWeight: "700" },
  status: { color: colors.silver, fontSize: 18, marginTop: spacing.sm, textAlign: "center" },
  digits: { color: colors.cyan, fontSize: 24, marginTop: spacing.sm, letterSpacing: 2 },
  controls: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-around", rowGap: spacing.lg },
  control: { alignItems: "center", width: "25%", minWidth: 80 },
  controlLabel: { color: colors.white, marginTop: spacing.xs, fontSize: 14, textAlign: "center" },
  incoming: { flexDirection: "row", justifyContent: "space-around", marginBottom: spacing.xl },
  bottom: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", marginTop: spacing.lg, marginBottom: spacing.md },
});
