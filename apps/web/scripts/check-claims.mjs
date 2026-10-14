/** Reject unverified AI launch promises in the public static export. */
const unapproved = [
  /\b(?:Claude|Anthropic)\b/i,
  /\b(?:AI monthly cap|monthly AI cost cap|plafond mensuel d['’]?IA|plafond IA)\b/i,
  /\b(?:5|five|cinq)\s+(?:minutes?|min)\b/i,
];

export function assertNoUnapprovedAiClaims(html, route) {
  const visible = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  for (const pattern of unapproved) {
    if (pattern.test(visible)) throw new Error("Unapproved AI claim on " + route);
  }
}
