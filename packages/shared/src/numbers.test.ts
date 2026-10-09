import { describe, expect, it } from "vitest";
import { isEmergencyNumber, isQuebecNumber, nextNumberState } from "./numbers.js";

const d = (s: string) => new Date(s);

describe("nextNumberState", () => {
  it("moves an inactive free number to grace after 30 days", () => {
    expect(nextNumberState({ state: "active", lastActivityAt: d("2026-01-01"), inactivityDays: 30, stateChangedAt: d("2026-01-01"), now: d("2026-01-31") })).toBe("grace");
  });
  it("never reclaims a locked plan", () => {
    expect(nextNumberState({ state: "active", lastActivityAt: d("2025-01-01"), inactivityDays: null, stateChangedAt: d("2025-01-01"), now: d("2026-01-01") })).toBeNull();
  });
  it("returns to active when the user comes back during grace", () => {
    expect(nextNumberState({ state: "grace", lastActivityAt: d("2026-02-02"), inactivityDays: 30, stateChangedAt: d("2026-01-31"), now: d("2026-02-03") })).toBe("active");
  });
  it("quarantines after the grace period, releases after 90 days", () => {
    expect(nextNumberState({ state: "grace", lastActivityAt: d("2026-01-01"), inactivityDays: 30, stateChangedAt: d("2026-01-31"), now: d("2026-02-07") })).toBe("quarantine");
    expect(nextNumberState({ state: "quarantine", lastActivityAt: d("2026-01-01"), inactivityDays: 30, stateChangedAt: d("2026-02-07"), now: d("2026-05-07") })).toBeNull();
    expect(nextNumberState({ state: "quarantine", lastActivityAt: d("2026-01-01"), inactivityDays: 30, stateChangedAt: d("2026-02-07"), now: d("2026-05-08") })).toBe("released");
  });
});

describe("numbers", () => {
  it("detects 9-1-1 in all dial forms", () => {
    for (const n of ["911", "9-1-1", "+1911", "1911"]) expect(isEmergencyNumber(n)).toBe(true);
    expect(isEmergencyNumber("+15149110000")).toBe(false);
  });
  it("detects Quebec numbers", () => {
    expect(isQuebecNumber("+15145550123")).toBe(true);
    expect(isQuebecNumber("+14165550123")).toBe(false);
  });
});
