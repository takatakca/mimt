import type { E911Address } from "@mimt/shared";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "../api/client";
import { toErrorKey } from "../api/errors";
import { useI18n, type TKey } from "../i18n";
import { normalizePostalCode, postalMatchesProvince, PROVINCES, type Province } from "../lib/address";
import { colors, radius, spacing, TAP } from "../theme";
import { Button, ErrorText, Field, Label } from "./ui";

/** Canadian civic address for 9-1-1 (PUT /v1/e911/address). Used in onboarding and in settings. */
export function AddressForm({ onSaved }: { onSaved: () => void }) {
  const { t } = useI18n();
  const [street, setStreet] = useState("");
  const [unit, setUnit] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState<Province>("QC");
  const [postal, setPostal] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"street" | "city" | "postal", TKey>>>({});
  const [submitError, setSubmitError] = useState<TKey | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Prefill when an address already exists (settings).
    api
      .getE911Address()
      .then((a) => {
        setStreet(a.street);
        setUnit(a.unit ?? "");
        setCity(a.city);
        if ((PROVINCES as readonly string[]).includes(a.province)) setProvince(a.province as Province);
        setPostal(a.postalCode);
      })
      .catch(() => undefined);
  }, []);

  async function submit() {
    const next: typeof errors = {};
    if (!street.trim()) next.street = "address.required";
    if (!city.trim()) next.city = "address.required";
    const normalized = normalizePostalCode(postal);
    if (!normalized || !postalMatchesProvince(normalized, province)) next.postal = "address.invalidPostal";
    setErrors(next);
    if (Object.keys(next).length > 0 || !normalized) return;
    const body: E911Address = {
      street: street.trim(),
      unit: unit.trim() || undefined,
      city: city.trim(),
      province,
      postalCode: normalized,
      country: "CA",
    };
    setBusy(true);
    setSubmitError(null);
    try {
      await api.putE911Address(body);
      onSaved();
    } catch (e) {
      setSubmitError(toErrorKey(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <View>
      <Field
        label={t("address.street")}
        placeholder={t("address.streetPlaceholder")}
        value={street}
        onChangeText={setStreet}
        autoComplete="street-address"
        textContentType="streetAddressLine1"
        error={errors.street ? t(errors.street) : null}
      />
      <Field label={t("address.unit")} value={unit} onChangeText={setUnit} textContentType="streetAddressLine2" />
      <Field
        label={t("address.city")}
        value={city}
        onChangeText={setCity}
        textContentType="addressCity"
        error={errors.city ? t(errors.city) : null}
      />
      <Label>{t("address.province")}</Label>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={t("address.province")}>
        {PROVINCES.map((p) => (
          <Pressable
            key={p}
            accessibilityRole="radio"
            accessibilityState={{ selected: p === province }}
            accessibilityLabel={p}
            onPress={() => setProvince(p)}
            style={[styles.chip, p === province && styles.chipOn]}
          >
            <Text style={[styles.chipText, p === province && { color: colors.navy }]}>{p}</Text>
          </Pressable>
        ))}
      </View>
      <Field
        label={t("address.postalCode")}
        placeholder={t("address.postalPlaceholder")}
        value={postal}
        onChangeText={setPostal}
        onBlur={() => setPostal((v) => normalizePostalCode(v) ?? v)}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={7}
        textContentType="postalCode"
        error={errors.postal ? t(errors.postal) : null}
      />
      {submitError ? <ErrorText>{t(submitError)}</ErrorText> : null}
      <Button label={t("common.save")} onPress={submit} loading={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    minWidth: TAP,
    minHeight: TAP,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chipOn: { backgroundColor: colors.electric, borderColor: colors.electric },
  chipText: { color: colors.white, fontWeight: "700", fontSize: 16 },
});
