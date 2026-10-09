// Pure i18n helpers (no React Native imports, unit-tested).
import { en } from "./en";
import { fr, type TKey } from "./fr";

export type Lang = "fr" | "en";
export type { TKey };

export const dictionaries: Record<Lang, Record<TKey, string>> = { fr, en };

/**
 * French is the default (Charter of the French language, s. 52.1). The app follows the device only
 * when its first preferred language is English; any other language falls back to French.
 */
export function pickLanguage(deviceLanguageCodes: readonly (string | null | undefined)[], saved?: string | null): Lang {
  if (saved === "fr" || saved === "en") return saved;
  const first = deviceLanguageCodes[0]?.toLowerCase() ?? "";
  return first === "en" || first.startsWith("en-") ? "en" : "fr";
}

export type Vars = Record<string, string | number>;

export function translate(lang: Lang, key: TKey, vars?: Vars): string {
  const template = dictionaries[lang][key] ?? fr[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

/** BCP-47 tag used for the API and Intl formatting. */
export function localeTag(lang: Lang): "fr-CA" | "en-CA" {
  return lang === "fr" ? "fr-CA" : "en-CA";
}
