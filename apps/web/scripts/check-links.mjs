import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "out");
const BASE_URL = "https://mimt.ca/";

function decodeEntities(value) {
  return value.replace(/&(?:amp|quot|apos|#39|#x([0-9a-f]+)|#([0-9]+));/gi, (entity, hex, dec) => {
    if (hex) return String.fromCodePoint(parseInt(hex, 16));
    if (dec) return String.fromCodePoint(parseInt(dec, 10));
    return { "&amp;": "&", "&quot;": '"', "&apos;": "'", "&#39;": "'" }[entity.toLowerCase()] ?? entity;
  });
}

function* indexFiles(root, directory = root) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) yield* indexFiles(root, fullPath);
    else if (entry.isFile() && entry.name === "index.html") yield fullPath;
  }
}

export function extractAnchors(html) {
  // Read only generated HTML, never user-supplied or unsanitized HTML.
  return [...html.matchAll(/<a(?=\s|>)[^>]*?\s+href\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)]
    .map((match) => decodeEntities(match[1] ?? match[2] ?? ""));
}

function elementIds(html) {
  return new Set([...html.matchAll(/<[a-z][^>]*?\s+id\s*=\s*(?:"([^"]+)"|'([^']+)')/gi)]
    .map((match) => decodeEntities(match[1] ?? match[2] ?? "")));
}

/** Check internal links and section anchors in every exported HTML route. */
export function checkSiteLinks(root = DEFAULT_ROOT) {
  const files = [...indexFiles(root)];
  const errors = [];
  let checkedLinks = 0;
  const cache = new Map();
  const read = (path) => {
    if (!cache.has(path)) cache.set(path, readFileSync(path, "utf8"));
    return cache.get(path);
  };

  for (const file of files) {
    const relativePath = relative(root, file).replaceAll(sep, "/");
    const route = relativePath === "index.html" ? "/" : "/" + relativePath.slice(0, -"index.html".length);
    for (const raw of extractAnchors(read(file))) {
      if (!raw || raw === "#") continue;
      let target;
      try {
        target = new URL(raw, new URL(route, BASE_URL));
      } catch {
        errors.push(route + ": invalid link " + JSON.stringify(raw));
        continue;
      }
      if (target.protocol === "javascript:" || target.protocol === "data:") {
        errors.push(route + ": unsafe link protocol");
        continue;
      }
      if (target.origin !== "https://mimt.ca") continue;
      checkedLinks++;
      let pathname;
      try {
        pathname = decodeURIComponent(target.pathname);
      } catch {
        errors.push(route + ": invalid encoded link " + JSON.stringify(raw));
        continue;
      }
      const targetFile = resolve(root, "." + pathname, pathname.endsWith("/") ? "index.html" : "");
      if (!targetFile.startsWith(root + sep)) {
        errors.push(route + ": link escapes site root " + raw);
        continue;
      }
      if (!existsSync(targetFile)) {
        errors.push(route + ": missing destination " + target.pathname + " from " + JSON.stringify(raw));
        continue;
      }
      if (target.hash && targetFile.endsWith(".html")) {
        let id;
        try {
          id = decodeURIComponent(target.hash.slice(1));
        } catch {
          errors.push(route + ": invalid fragment " + JSON.stringify(raw));
          continue;
        }
        if (id && !elementIds(read(targetFile)).has(id)) {
          errors.push(route + ": missing #" + id + " at " + target.pathname);
        }
      }
    }
  }
  if (!files.length) errors.push("No exported index.html pages found");
  return { pages: files.length, links: checkedLinks, errors };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = checkSiteLinks();
  if (result.errors.length) {
    console.error(result.errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log("MIMT site links validated: " + result.links + " links on " + result.pages + " pages.");
  }
}
