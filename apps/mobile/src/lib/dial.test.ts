import { describe, expect, it } from "vitest";
import { canPlaceCall, formatAsYouType, formatPhone, normalizeDialInput, toDialable } from "./dial";

describe("normalizeDialInput", () => {
  it("keeps digits, * and # and a leading +", () => {
    expect(normalizeDialInput(" (514) 555-0123 ")).toBe("5145550123");
    expect(normalizeDialInput("+1 514.555.0123")).toBe("+15145550123");
    expect(normalizeDialInput("*98#")).toBe("*98#");
    expect(normalizeDialInput("51+4")).toBe("514");
  });
});

describe("toDialable", () => {
  it("turns 10 and 11 digit NANP numbers into E.164", () => {
    expect(toDialable("514 555-0123")).toBe("+15145550123");
    expect(toDialable("1-438-555-0199")).toBe("+14385550199");
    expect(toDialable("+1 (819) 555-0100")).toBe("+18195550100");
  });
  it("maps every 9-1-1 form to 911", () => {
    for (const n of ["911", "9-1-1", "+1911", "1911"]) expect(toDialable(n)).toBe("911");
  });
  it("rejects invalid numbers", () => {
    expect(toDialable("555-0123")).toBeNull();
    expect(toDialable("0145550123")).toBeNull(); // area code cannot start with 0
    expect(toDialable("*98")).toBeNull();
    expect(toDialable("+33123456789")).toBeNull(); // international not dialable from the free app
  });
});

describe("formatting", () => {
  it("formats the Quebec way", () => {
    expect(formatPhone("+15145550123")).toBe("514 555-0123");
    expect(formatPhone("911")).toBe("9-1-1");
    expect(formatPhone("abc")).toBe("abc");
  });
  it("formats while typing", () => {
    expect(formatAsYouType("514")).toBe("514");
    expect(formatAsYouType("51455")).toBe("514 55");
    expect(formatAsYouType("5145550123")).toBe("514 555-0123");
    expect(formatAsYouType("15145550123")).toBe("1 514 555-0123");
    expect(formatAsYouType("911")).toBe("911");
  });
});

describe("canPlaceCall", () => {
  const none = { addressRegistered: false, noticeAccepted: false };
  const ok = { addressRegistered: true, noticeAccepted: true };
  it("ALWAYS allows 9-1-1, whatever the onboarding state", () => {
    expect(canPlaceCall("911", none)).toBe(true);
    expect(canPlaceCall("9-1-1", null)).toBe(true);
    expect(canPlaceCall("+1911", undefined)).toBe(true);
  });
  it("needs a 9-1-1 address and accepted notice for other calls", () => {
    expect(canPlaceCall("5145550123", none)).toBe(false);
    expect(canPlaceCall("5145550123", { addressRegistered: true, noticeAccepted: false })).toBe(false);
    expect(canPlaceCall("5145550123", ok)).toBe(true);
    expect(canPlaceCall("12", ok)).toBe(false);
  });
});
