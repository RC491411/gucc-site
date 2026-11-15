// Post-build: replace prerendered pages of legacy URLs with tiny static redirect pages,
// so any static host (no server rules needed) sends /team to /founders.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const OUT = "dist/client";
const REDIRECTS = { "/team": "/founders" };

for (const [from, to] of Object.entries(REDIRECTS)) {
  const file = join(OUT, from, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(
    file,
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Redirecting…</title>` +
      `<link rel="canonical" href="${to}"><meta name="robots" content="noindex">` +
      `<meta http-equiv="refresh" content="0; url=${to}">` +
      `<script>location.replace(${JSON.stringify(to)}+location.search+location.hash)</script>` +
      `</head><body><p><a href="${to}">Continue to ${to}</a></p></body></html>\n`,
  );
  console.log(`[static-redirects] ${from} -> ${to}`);
}

// The SPA fallback (404.html) is prerendered from the home route: mark it noindex and drop the
// home canonical so unknown URLs are never treated as copies of the home page.
{
  const { readFileSync } = await import("node:fs");
  const file = join(OUT, "404.html");
  const html = readFileSync(file, "utf8")
    .replace('<meta name="robots" content="index, follow"/>', '<meta name="robots" content="noindex"/>')
    .replace(/<link rel="canonical" href="[^"]*"\/>/, "");
  writeFileSync(file, html);
  console.log("[static-redirects] 404.html -> noindex");
}
