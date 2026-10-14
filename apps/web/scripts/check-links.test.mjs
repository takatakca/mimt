import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { checkSiteLinks, extractAnchors } from "./check-links.mjs";

function fixture(pages, verify) {
  const dir = mkdtempSync(join(tmpdir(), "mimt-link-check-"));
  try {
    for (const [route, html] of Object.entries(pages)) {
      const destination = join(dir, route);
      mkdirSync(destination, { recursive: true });
      writeFileSync(join(destination, "index.html"), html);
    }
    return verify(checkSiteLinks(dir));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("recognizes quoted links and HTML entities", () => {
  assert.deepEqual(extractAnchors('<a href="/?a=1&amp;b=2">A</a><a href=\'#help\'>B</a>'), ["/?a=1&b=2", "#help"]);
});

test("validates cross-language paths, fragments and external links", () => {
  fixture({
    "": '<main id="content"><a href="/en/#start">EN</a><a href="#content">Top</a><a href="mailto:info@mimt.ca">Email</a><a href="https://example.org/help">Help</a></main>',
    "en": '<section id="start"><a href="../#content">FR</a></section>',
  }, (result) => {
    assert.deepEqual(result.errors, []);
    assert.equal(result.pages, 2);
    assert.equal(result.links, 3);
  });
});

test("reports a missing destination and a missing section", () => {
  fixture({
    "": '<a href="/missing/">Missing</a><a href="/en/#absent">Absent</a>',
    "en": '<section id="there">Present</section>',
  }, (result) => {
    assert.equal(result.errors.length, 2);
    assert.match(result.errors[0], /missing destination/);
    assert.match(result.errors[1], /missing #absent/);
  });
});

test("rejects unsafe javascript links", () => {
  fixture({ "": '<a href="javascript:alert(1)">Unsafe</a>' }, (result) => {
    assert.match(result.errors.join(" "), /unsafe link protocol/);
  });
});

test("ignores data-href and only audits actual anchor href attributes", () => {
  assert.deepEqual(extractAnchors('<a data-href="/not-a-link/">Preview</a><a data-href="/ignored/" href="/en/">English</a>'), ["/en/"]);
  fixture({ "": '<a data-href="/missing/">Not a link</a><a href="/en/">English</a>', "en": "<h1>EN</h1>" }, (result) => {
    assert.deepEqual(result.errors, []);
    assert.equal(result.links, 1);
  });
});

test("does not accept data-id as an anchor target", () => {
  fixture({ "": '<a href="/en/#missing">Go</a>', "en": '<section data-id="missing">Not a fragment target</section>' }, (result) => {
    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0], /missing #missing/);
  });
});

test("accepts real id when a tag also has data-id", () => {
  fixture({ "": '<a href="/en/#present">Go</a>', "en": '<section data-id="other" id="present">Valid fragment</section>' }, (result) => {
    assert.deepEqual(result.errors, []);
  });
});
