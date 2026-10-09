import { Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts/legacy";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Body, Button, Card, Field, Heading, Loading, Row, Screen, Title } from "../../src/components/ui";
import { useI18n } from "../../src/i18n";
import { normalizeDialInput, toDialable } from "../../src/lib/dial";
import { callService } from "../../src/services/call";
import { colors, spacing, TAP } from "../../src/theme";

interface Person {
  id: string;
  name: string;
  phone: string;
}

/** Device contacts. Read on the device only; never uploaded (see contacts.permissionBody). */
export default function ContactsTab() {
  const { t } = useI18n();
  const router = useRouter();
  const [permission, setPermission] = useState<"unknown" | "granted" | "denied">("unknown");
  const [people, setPeople] = useState<Person[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    Contacts.getPermissionsAsync().then((p) => setPermission(p.granted ? "granted" : p.canAskAgain ? "unknown" : "denied"));
  }, []);

  useEffect(() => {
    if (permission !== "granted") return;
    Contacts.getContactsAsync({ fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers], sort: Contacts.SortTypes.FirstName })
      .then(({ data }) =>
        setPeople(
          data.flatMap((c) => {
            const raw = c.phoneNumbers?.[0]?.number;
            return raw ? [{ id: c.id ?? raw, name: c.name || raw, phone: normalizeDialInput(raw) }] : [];
          }),
        ),
      )
      .catch(() => setPeople([]));
  }, [permission]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (people ?? []).filter((p) => !q || p.name.toLowerCase().includes(q) || p.phone.includes(q));
  }, [people, query]);

  if (permission !== "granted") {
    return (
      <Screen edges={["top"]}>
        <Title>{t("contacts.title")}</Title>
        <Card>
          <Heading>{t("contacts.permissionTitle")}</Heading>
          <Body muted>{t("contacts.permissionBody")}</Body>
          {permission === "denied" ? (
            <Body>{t("contacts.denied")}</Body>
          ) : (
            <Button
              label={t("contacts.allow")}
              onPress={async () => {
                const p = await Contacts.requestPermissionsAsync();
                setPermission(p.granted ? "granted" : "denied");
              }}
            />
          )}
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll={false} edges={["top"]}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        <Title>{t("contacts.title")}</Title>
        <Field label={t("contacts.search")} value={query} onChangeText={setQuery} autoCorrect={false} />
      </View>
      {people === null ? (
        <Loading label={t("common.loading")} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingHorizontal: spacing.md }}
          ListEmptyComponent={<Body muted>{t("contacts.empty")}</Body>}
          renderItem={({ item }) => {
            const dialable = toDialable(item.phone);
            return (
              <Row
                icon="person-circle"
                title={item.name}
                subtitle={item.phone}
                right={
                  <View style={{ flexDirection: "row" }}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t("contacts.text", { name: item.name })}
                      disabled={!dialable}
                      onPress={() => dialable && router.push(`/thread/${encodeURIComponent(dialable)}`)}
                      style={styles.icon}
                    >
                      <Ionicons name="chatbubble" size={22} color={colors.electric} />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t("contacts.call", { name: item.name })}
                      onPress={() => callService.connect(item.phone)}
                      style={styles.icon}
                    >
                      <Ionicons name="call" size={22} color={colors.success} />
                    </Pressable>
                  </View>
                }
              />
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: { width: TAP, height: TAP, alignItems: "center", justifyContent: "center" },
});
