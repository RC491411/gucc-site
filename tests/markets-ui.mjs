// Browser regression tests against a fresh LOCAL static production build.
// All outside requests are blocked; snapshot requests are mocked. No contact form submission.
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
const port = 8092;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "pipe" });
let logs = "";
server.stdout.on("data", d => { logs += d; }); server.stderr.on("data", d => { logs += d; });
let browser;
try {
  let started = false;
  for (let i = 0; i < 80; i++) {
    if (server.exitCode !== null) throw new Error(logs);
    try { const r = await fetch(origin); if (r.ok) { started = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(started, `Local server failed: ${logs}`);
  browser = await chromium.launch({ headless: true });
  for (const lang of ["en", "fr"]) {
    for (const mobile of [false, true]) {
      for (const mode of ["empty", "http", "non-json", "network", "tampered"]) {
        const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 }, reducedMotion: "reduce" });
        await context.addInitScript(({ lang }) => {
          localStorage.setItem("gucc-lang-v2", lang);
          localStorage.setItem("gucc-live-quotes-v1", JSON.stringify({ fetchedAt: Date.now(), rows: [{ code: "WTI_USD", price: 999999, change_24h: 55 }] }));
        }, { lang });
        let gets = 0;
        await context.route("**/*", async route => {
          const req = route.request();
          assert.equal(req.method(), "GET", "No contact messages or other POSTs permitted");
          if (!req.url().startsWith(origin)) return route.abort("blockedbyclient");
          if (!req.url().includes("/data/market-closes.v2.json")) return route.continue();
          gets++;
          if (mode === "network") return route.abort("failed");
          if (mode === "http") return route.fulfill({ status: 500, body: "Unavailable" });
          if (mode === "non-json") return route.fulfill({ status: 200, contentType: "text/html", body: "<html>bad</html>" });
          const json = mode === "tampered" ? {
            schemaVersion: 2, generatedAt: new Date().toISOString(),
            quotes: [{ symbol: "WTI", price: 999999, change: 0, live: true, status: "verified", close: { price: 999999, kind: "session_close", final: true } }],
          } : { schemaVersion: 2, generatedAt: null, quotes: [] };
          return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(json) });
        });
        const page = await context.newPage();
        await page.goto(`${origin}/markets`);
        await page.waitForFunction(lang => document.documentElement.lang === lang && localStorage.getItem("gucc-live-quotes-v1") === null, lang);
        assert.ok(gets >= 1);
        const ticker = page.locator(".ticker-status");
        assert.equal(await ticker.count(), 20);
        const unavailable = lang === "fr" ? "Clôture indisponible" : "Close unavailable";
        for (const text of await ticker.allTextContents()) assert.equal(text, unavailable);
        const tickerText = await ticker.first().locator("..").textContent();
        assert.ok(!tickerText.includes("%"));
        for (const [key, count] of [["energy", 3], ["metals", 4], ["ag", 3]]) {
          await page.locator(`[data-desk="${key}"]`).click();
          await page.waitForFunction(count => document.querySelectorAll(".commodity-card").length === count, count);
          assert.deepEqual(await page.locator(".market-price").allTextContents(), Array(count).fill("—"));
          assert.deepEqual(await page.locator(".market-status").allTextContents(), Array(count).fill(unavailable));
          assert.equal(await page.locator(".market-change").count(), 0);
          assert.equal(await page.locator(".market-chart-unavailable").count(), count);
          assert.equal(await page.locator(".market-spread").count(), 0);
          const text = (await page.locator(".commodity-card").allTextContents()).join(" ");
          assert.ok(!/999999|\+0\.00%|live quote|2026-\d{2}-\d{2}|T\d{2}:\d{2}/i.test(text));
          assert.equal(await page.locator(".commodity-card .text-up, .commodity-card .text-down").count(), 0);
        }
        console.log(`PASS ${lang} ${mobile ? "mobile" : "desktop"} ${mode}: ten closes unavailable, neutral ticker/cards/charts, no dates, no legacy cache`);
        await context.close();
      }
    }
  }
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
