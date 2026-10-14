import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "out");
const routes = [
  ["", "en"], ["forfaits", "en/plans"], ["affaires", "en/business"],
  ["ia", "en/ai"], ["comparer", "en/compare"], ["app-web", "en/web-app"],
  ["bientot", "en/coming-soon"], ["9-1-1", "en/9-1-1"], ["aide", "en/help"],
  ["plaintes", "en/complaints"], ["confidentialite", "en/privacy"],
  ["conditions", "en/terms"], ["accessibilite", "en/accessibility"],
  ["contact", "en/contact"],
];

let checked = 0;
for (const [fr, en] of routes) {
  for (const [route, lang] of [[fr, "fr-CA"], [en, "en-CA"]]) {
    const path = join(root, route, "index.html");
    if (!existsSync(path)) throw new Error("Missing page: " + path);
    const html = readFileSync(path, "utf8");
    if (!html.includes('lang="' + lang + '"')) throw new Error("Wrong language: " + path);
    if (!html.includes("<title>")) throw new Error("Missing title: " + path);
    checked++;
  }
}
for (const asset of ["404.html", "robots.txt", "sitemap.xml", "og.png", "favicon.svg"]) {
  if (!existsSync(join(root, asset))) throw new Error("Missing asset: " + asset);
}
const sitemap = readFileSync(join(root, "sitemap.xml"), "utf8");
for (const pair of routes) for (const route of pair) {
  const url = "https://mimt.ca/" + (route ? route + "/" : "");
  if (!sitemap.includes(url)) throw new Error("Missing sitemap route: " + url);
}
console.log("MIMT static export validated: " + checked + " localized pages.");
