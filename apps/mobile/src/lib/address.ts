// Canadian civic address helpers for the 9-1-1 form (pure, unit-tested).

export const PROVINCES = ["QC", "ON", "NB", "NS", "PE", "NL", "MB", "SK", "AB", "BC", "YT", "NT", "NU"] as const;
export type Province = (typeof PROVINCES)[number];

// Canada Post: no D, F, I, O, Q, U anywhere; no W or Z in first position.
const POSTAL = /^([ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z])\s?(\d[ABCEGHJ-NPRSTV-Z]\d)$/;

/** "h3b1a1" → "H3B 1A1"; null when invalid. */
export function normalizePostalCode(raw: string): string | null {
  const m = POSTAL.exec(raw.trim().toUpperCase().replace(/\s+/g, " "));
  return m ? `${m[1]} ${m[2]}` : null;
}

/** First letter of the postal code must match the province (Canada Post FSA ranges). */
const FSA_PROVINCE: Record<string, Province[]> = {
  A: ["NL"], B: ["NS"], C: ["PE"], E: ["NB"], G: ["QC"], H: ["QC"], J: ["QC"], K: ["ON"], L: ["ON"],
  M: ["ON"], N: ["ON"], P: ["ON"], R: ["MB"], S: ["SK"], T: ["AB"], V: ["BC"], X: ["NT", "NU"], Y: ["YT"],
};

export function postalMatchesProvince(postal: string, province: Province): boolean {
  const allowed = FSA_PROVINCE[postal.charAt(0).toUpperCase()];
  return !!allowed && allowed.includes(province);
}
