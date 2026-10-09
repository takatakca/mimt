// Phone number lifecycle (docs/MIMT-MVP.md §7, number recycling).

export type NumberState = "active" | "locked" | "grace" | "quarantine" | "released" | "porting_in" | "porting_out";

export const GRACE_DAYS = 7;
export const QUARANTINE_DAYS = 90;
export const INACTIVITY_WARNING_DAYS = [20, 27] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface NumberLifecycleInput {
  state: NumberState;
  lastActivityAt: Date;
  /** null = plan never reclaims the number (locked or paid). */
  inactivityDays: number | null;
  stateChangedAt: Date;
  now: Date;
}

/** Next state for the daily lifecycle job, or null if nothing changes. Pure, so it is unit-tested. */
export function nextNumberState(i: NumberLifecycleInput): NumberState | null {
  const sinceActivity = (i.now.getTime() - i.lastActivityAt.getTime()) / DAY_MS;
  const sinceChange = (i.now.getTime() - i.stateChangedAt.getTime()) / DAY_MS;
  switch (i.state) {
    case "active":
      if (i.inactivityDays !== null && sinceActivity >= i.inactivityDays) return "grace";
      return null;
    case "locked":
      return null;
    case "grace":
      if (i.inactivityDays === null || sinceActivity < (i.inactivityDays ?? 0)) return "active";
      if (sinceChange >= GRACE_DAYS) return "quarantine";
      return null;
    case "quarantine":
      if (sinceChange >= QUARANTINE_DAYS) return "released";
      return null;
    default:
      return null;
  }
}

/** E.164 for Canada/US (NANP). */
export const NANP_E164 = /^\+1[2-9]\d{2}[2-9]\d{6}$/;

/** Quebec area codes (for the 9-1-1 municipal tax and number search defaults). */
export const QUEBEC_AREA_CODES = ["418", "438", "450", "514", "579", "581", "819", "873", "354", "367", "263", "468"] as const;

export function isQuebecNumber(e164: string): boolean {
  return NANP_E164.test(e164) && (QUEBEC_AREA_CODES as readonly string[]).includes(e164.slice(2, 5));
}

/** Emergency and N11 short codes. 9-1-1 must never be blocked by caps, credit or plan. */
export function isEmergencyNumber(dialed: string): boolean {
  const d = dialed.replace(/[^\d+]/g, "");
  return d === "911" || d === "+1911" || d === "1911";
}
