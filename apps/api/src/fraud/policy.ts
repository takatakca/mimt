import type { RateRule } from "./rateLimiter.js";

const MIN = 60;
const HOUR = 3600;
const DAY = 86400;

export const SMS_RATE_RULES: Record<"minute" | "hour" | "day", RateRule> = {
  minute: { capacity: 20, windowSeconds: MIN },
  hour: { capacity: 120, windowSeconds: HOUR },
  day: { capacity: 400, windowSeconds: DAY },
};

export const CALL_ATTEMPT_RULES: Record<"minute" | "hour", RateRule> = {
  minute: { capacity: 6, windowSeconds: MIN },
  hour: { capacity: 60, windowSeconds: HOUR },
};

/** Max first-time recipients per hour (halved for new accounts). */
export const NEW_RECIPIENTS_PER_HOUR = 10;
/** Same body to this many distinct recipients within the window = bulk send. */
export const BULK_IDENTICAL_RECIPIENTS = 3;
export const BULK_IDENTICAL_WINDOW_MS = 10 * 60 * 1000;

/** Verification-code-shaped text (free accounts are not an OTP gateway). */
export function looksLikeOtp(body: string): boolean {
  return /\b(code|otp|pin|verification|vérification|v[ée]rif)\b/i.test(body) && /\b\d{4,8}\b/.test(body);
}
