import type { TKey } from "../i18n/core";

/** "14 h 05", "Hier", "3 oct." — short timestamps for lists. */
export function formatWhen(iso: string, locale: string, t: (k: TKey) => string, now = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (days === 0) return d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return t("common.yesterday");
  return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

/** mm:ss call timer. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}
