// Which onboarding step a signed-in user still needs (pure, unit-tested).
import type { MeResponse } from "@mimt/shared";

export type OnboardingStep = "address" | "notice" | "number";

export function nextOnboardingStep(me: Pick<MeResponse, "e911" | "numbers">): OnboardingStep | null {
  if (!me.e911.addressRegistered) return "address";
  if (!me.e911.noticeAccepted) return "notice";
  if (me.numbers.length === 0) return "number";
  return null;
}

/** Order area codes for the picker: Montréal first, then the rest of Quebec. */
export function sortAreaCodes(codes: readonly string[]): string[] {
  const priority = ["514", "438", "450", "579", "418", "581", "819", "873", "367", "354", "263", "468"];
  return [...codes].sort((a, b) => {
    const ia = priority.indexOf(a);
    const ib = priority.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
  });
}
