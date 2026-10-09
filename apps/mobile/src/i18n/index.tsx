import { getLocales } from "expo-localization";
import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { localeTag, pickLanguage, translate, type Lang, type TKey, type Vars } from "./core";

export type { Lang, TKey } from "./core";

const STORAGE_KEY = "mimt.lang";

interface I18n {
  lang: Lang;
  locale: "fr-CA" | "en-CA";
  t: (key: TKey, vars?: Vars) => string;
  setLang: (lang: Lang) => Promise<void>;
}

function deviceLanguages(): string[] {
  try {
    return getLocales().map((l) => l.languageCode ?? l.languageTag);
  } catch {
    return [];
  }
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => pickLanguage(deviceLanguages()));

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((saved) => setLangState(pickLanguage(deviceLanguages(), saved)))
      .catch(() => undefined);
  }, []);

  const setLang = useCallback(async (next: Lang) => {
    setLangState(next);
    await SecureStore.setItemAsync(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo<I18n>(
    () => ({ lang, locale: localeTag(lang), t: (key, vars) => translate(lang, key, vars), setLang }),
    [lang, setLang],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
