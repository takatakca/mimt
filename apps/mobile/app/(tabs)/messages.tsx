import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { api } from "../../src/api/client";
import type { Conversation } from "../../src/api/types";
import { AdBanner } from "../../src/components/Ads";
import { Body, Button, ErrorText, Row, Screen, Title } from "../../src/components/ui";
import { useI18n } from "../../src/i18n";
import { formatPhone } from "../../src/lib/dial";
import { formatWhen } from "../../src/lib/format";
import { useAsync } from "../../src/lib/useAsync";
import { colors, spacing } from "../../src/theme";

export default function Messages() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const list = useAsync(() => api.conversations().then((r) => r.conversations));
  useFocusEffect(useCallback(() => void list.reload(), [list.reload]));

  const renderItem = ({ item }: { item: Conversation }) => (
    <Row
      icon="person-circle"
      title={formatPhone(item.peer)}
      subtitle={item.lastMessage}
      label={`${formatPhone(item.peer)}, ${item.lastMessage}, ${formatWhen(item.lastAt, locale, t)}`}
      onPress={() => router.push(`/thread/${encodeURIComponent(item.peer)}`)}
      right={
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.when}>{formatWhen(item.lastAt, locale, t)}</Text>
          {item.unread > 0 ? <Text style={styles.badge}>{item.unread}</Text> : null}
        </View>
      }
    />
  );

  return (
    <Screen scroll={false} edges={["top"]}>
      <View style={styles.header}>
        <Title>{t("messages.title")}</Title>
        <Button icon="create" label={t("messages.new")} onPress={() => router.push("/thread/new")} />
      </View>
      {list.errorKey ? <ErrorText>{t(list.errorKey)}</ErrorText> : null}
      <FlatList
        data={list.data ?? []}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        refreshControl={<RefreshControl refreshing={list.loading} onRefresh={list.reload} tintColor={colors.electric} />}
        ListEmptyComponent={!list.loading ? <Body muted>{t("messages.empty")}</Body> : null}
      />
      <AdBanner />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  when: { color: colors.silver, fontSize: 13 },
  badge: {
    marginTop: 4,
    backgroundColor: colors.electric,
    color: colors.navy,
    fontWeight: "800",
    borderRadius: 12,
    minWidth: 24,
    textAlign: "center",
    overflow: "hidden",
    paddingHorizontal: 6,
  },
});
