import { planHas } from "@mimt/shared";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, RefreshControl, View } from "react-native";
import { api } from "../../src/api/client";
import type { Voicemail } from "../../src/api/types";
import { useSession } from "../../src/auth/session";
import { Body, Button, Card, ErrorText, Label, Row, Screen, Title } from "../../src/components/ui";
import { useI18n } from "../../src/i18n";
import { formatPhone } from "../../src/lib/dial";
import { formatDuration, formatWhen } from "../../src/lib/format";
import { useAsync } from "../../src/lib/useAsync";
import { callService } from "../../src/services/call";
import { colors, spacing } from "../../src/theme";

export default function VoicemailTab() {
  const { t, locale } = useI18n();
  const list = useAsync(() => api.voicemails().then((r) => r.voicemails));
  const [openId, setOpenId] = useState<string | null>(null);
  useFocusEffect(useCallback(() => void list.reload(), [list.reload]));

  function remove(vm: Voicemail) {
    Alert.alert(t("voicemail.title"), t("voicemail.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          await api.deleteVoicemail(vm.id).catch(() => undefined);
          list.setData((list.data ?? []).filter((v) => v.id !== vm.id));
        },
      },
    ]);
  }

  return (
    <Screen scroll={false} edges={["top"]}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        <Title>{t("voicemail.title")}</Title>
        {list.errorKey ? <ErrorText>{t(list.errorKey)}</ErrorText> : null}
      </View>
      <FlatList
        data={list.data ?? []}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={<RefreshControl refreshing={list.loading} onRefresh={list.reload} tintColor={colors.electric} />}
        ListEmptyComponent={!list.loading ? <Body muted>{t("voicemail.empty")}</Body> : null}
        renderItem={({ item }) => (
          <Card>
            <Row
              icon="recording"
              title={formatPhone(item.from)}
              subtitle={`${formatWhen(item.receivedAt, locale, t)} · ${formatDuration(item.durationS)}`}
              onPress={() => setOpenId(openId === item.id ? null : item.id)}
            />
            {openId === item.id ? <VoicemailDetail vm={item} onDelete={() => remove(item)} /> : null}
          </Card>
        )}
      />
    </Screen>
  );
}

function VoicemailDetail({ vm, onDelete }: { vm: Voicemail; onDelete: () => void }) {
  const { t } = useI18n();
  const { me } = useSession();
  const player = useAudioPlayer(vm.audioUrl);
  const status = useAudioPlayerStatus(player);
  const canTranscribe = !!me && planHas(me.account.plan, "vm_transcription");

  return (
    <View style={{ marginTop: spacing.sm }}>
      <Button
        icon={status.playing ? "pause" : "play"}
        label={`${status.playing ? t("voicemail.pause") : t("voicemail.play")} · ${formatDuration(status.currentTime)} / ${formatDuration(vm.durationS)}`}
        onPress={() => {
          if (status.playing) player.pause();
          else {
            if (status.didJustFinish || status.currentTime >= (status.duration || vm.durationS)) player.seekTo(0);
            player.play();
          }
        }}
      />
      <Label>{t("voicemail.transcript")}</Label>
      <Body muted={!vm.transcript}>{vm.transcript ?? (canTranscribe ? t("common.empty") : t("voicemail.noTranscript"))}</Body>
      <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm, flexWrap: "wrap" }}>
        <Button icon="call" variant="success" label={t("voicemail.callBack")} onPress={() => callService.connect(vm.from)} style={{ flexGrow: 1 }} />
        <Button icon="trash" variant="ghost" label={t("common.delete")} onPress={onDelete} style={{ flexGrow: 1 }} />
      </View>
    </View>
  );
}
