import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROUTE_PAIRS = [
  ["", "en"], ["forfaits", "en/plans"], ["affaires", "en/business"],
  ["ia", "en/ai"], ["comparer", "en/compare"], ["app-web", "en/web-app"],
  ["bientot", "en/coming-soon"], ["9-1-1", "en/9-1-1"], ["aide", "en/help"],
  ["plaintes", "en/complaints"], ["confidentialite", "en/privacy"],
  ["conditions", "en/terms"], ["accessibilite", "en/accessibility"],
  ["contact", "en/contact"],
];

const BASE = "https://mimt.ca/";

function attributes(tag) {
  const result = new Map();
  for (const match of tag.matchAll(/(?:^|\s)([a-z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    result.set(match[1].toLowerCase(), match[2] ?? match[3]);
  }
  return result;
}

function headLinks(html) {
  const head = html.match(/<head(?:\s[^>]*)?>([\s\S]*?)<\/head\s*>/i)?.[1];
  if (head === undefined) return null;
  return [...head.matchAll(/<link(?=[\s/>])[^>]*>/gi)].map((match) => attributes(match[0]));
}

/** Ensure both languages publish reciprocal canonical and hreflang metadata. */
export function checkAlternates(root, pairs = ROUTE_PAIRS) {
  const errors = [];
  for (const [fr, en] of pairs) {
    const expected = new Map([
      ["fr-ca", BASE + (fr ? fr + "/" : "")],
      ["en-ca", BASE + en + "/"],
      ["x-default", BASE + (fr ? fr + "/" : "")],
    ]);
    for (const [route, locale] of [[fr, "fr-ca"], [en, "en-ca"]]) {
      const path = join(root, route, "index.html");
      const label = "/" + (route ? route + "/" : "");
      if (!existsSync(path)) {
        errors.push(label + ": missing HTML page");
        continue;
      }
      const links = headLinks(readFileSync(path, "utf8"));
      if (!links) {
        errors.push(label + ": missing HTML head");
        continue;
      }
      const canonicals = links.filter((attrs) => (attrs.get("rel") ?? "").toLowerCase().split(/\s+/).includes("canonical"));
      if (canonicals.length !== 1 || canonicals[0].get("href") !== expected.get(locale)) {
        errors.push(label + ": invalid or duplicate canonical");
      }
      const alternates = links.filter((attrs) => (attrs.get("rel") ?? "").toLowerCase().split(/\s+/).includes("alternate") && attrs.has("hreflang"));
      for (const [language, url] of expected) {
        const matches = alternates.filter((attrs) => attrs.get("hreflang")?.toLowerCase() === language);
        if (matches.length !== 1 || matches[0].get("href") !== url) {
          errors.push(label + ": invalid or duplicate hreflang " + language);
        }
      }
      if (alternates.length !== expected.size) errors.push(label + ": unexpected hreflang entries");
    }
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..", "out");
  const errors = checkAlternates(root);
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("MIMT bilingual canonical and hreflang metadata validated.");
  }
}
