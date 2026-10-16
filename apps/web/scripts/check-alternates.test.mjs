import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { checkAlternates } from "./check-alternates.mjs";

const PAIR = [["", "en"]];
function page(canonical, overrides = {}) {
  const urls = { "fr-CA": "https://mimt.ca/", "en-CA": "https://mimt.ca/en/", "x-default": "https://mimt.ca/", ...overrides };
  return "<html><head><title>MIMT</title>" +
    `<link rel="canonical" href="${canonical}">` +
    Object.entries(urls).map(([lang, url]) => `<link rel="alternate" hrefLang="${lang}" href="${url}">`).join("") +
    "</head><body></body></html>";
}
function fixture(fr, en, check) {
  const root = mkdtempSync(join(tmpdir(), "mimt-alternates-"));
  try {
    mkdirSync(join(root, "en"));
    writeFileSync(join(root, "index.html"), fr);
    writeFileSync(join(root, "en", "index.html"), en);
    check(checkAlternates(root, PAIR));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("accepts reciprocal bilingual canonicals and x-default", () => {
  fixture(page("https://mimt.ca/"), page("https://mimt.ca/en/"), (errors) => assert.deepEqual(errors, []));
});

test("rejects an English page canonicalized to French", () => {
  fixture(page("https://mimt.ca/"), page("https://mimt.ca/"), (errors) => assert.match(errors.join(" "), /\/en\/: invalid or duplicate canonical/));
});

test("rejects an incorrect English alternate on the French page", () => {
  fixture(page("https://mimt.ca/", { "en-CA": "https://other.example/en/" }), page("https://mimt.ca/en/"), (errors) => assert.match(errors.join(" "), /\/\: invalid or duplicate hreflang en-ca/));
});

test("rejects duplicate x-default entries", () => {
  const duplicate = page("https://mimt.ca/").replace("</head>", '<link rel="alternate" hreflang="x-default" href="https://mimt.ca/"></head>');
  fixture(duplicate, page("https://mimt.ca/en/"), (errors) => assert.match(errors.join(" "), /duplicate hreflang x-default/));
});

test("does not treat data-rel as a canonical", () => {
  const invalid = page("https://mimt.ca/").replace('rel="canonical"', 'data-rel="canonical"');
  fixture(invalid, page("https://mimt.ca/en/"), (errors) => assert.match(errors.join(" "), /invalid or duplicate canonical/));
});
