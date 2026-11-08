// Start the local Vite server first. All external requests are mocked/blocked.
// These are DOM/lifecycle regression tests, NOT evidence of live provider data.
import { chromium } from "playwright";
import assert from "node:assert/strict";
const base = process.env.GUCC_TEST_URL || "http://127.0.0.1:8082";
const expected = [
  "CAPITALCOM:XCUUSD",
  "CAPITALCOM:ALUMINUM",
  "CAPITALCOM:WHEAT",
  "CAPITALCOM:CORN",
  "CAPITALCOM:COCOA",
];
const codes = ["BRENT_CRUDE_USD", "WTI_USD", "NATURAL_GAS_USD", "GOLD_USD", "SILVER_USD"];
const browser = await chromium.launch({ headless: true });
try {
  for (const lang of ["en", "fr"]) {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "reduce",
    });
    let blockedWidgets = false;
    let posts = 0;
    let feedRequests = 0;
    await page.addInitScript((lang) => {
      localStorage.clear();
      localStorage.setItem("gucc-lang-v2", lang);
      window.__tvTests = [];
    }, lang);
    await page.route("**/*", async (route) => {
      const req = route.request(),
        url = req.url();
      if (req.method() === "POST") {
        posts++;
        return route.abort();
      }
      if (url.startsWith(base) || url.startsWith("data:") || url.startsWith("about:"))
        return route.continue();
      if (url.startsWith("https://api.oilpriceapi.com/v1/demo/prices?")) {
        feedRequests++;
        return route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              prices: codes.map((code, i) => ({ code, price: 100.25 + i, change_24h: i - 2 })),
            },
          }),
        });
      }
      if (url.startsWith("https://s3.tradingview.com/external-embedding/embed-widget-")) {
        if (blockedWidgets) return route.abort("blockedbyclient");
        return route.fulfill({
          contentType: "application/javascript",
          body: `(() => {
          const script = document.currentScript;
          const root = script?.parentElement;
          if (!root?.isConnected) return;
          const config = JSON.parse(script.textContent);
          window.__tvTests.push({ config, src: script.src });
          const iframe = document.createElement('iframe');
          iframe.title = 'Mock official widget';
          iframe.srcdoc = '<p>Mock provider chart for lifecycle testing only</p>';
          root.querySelector('.tradingview-widget-container__widget').replaceChildren(iframe);
        })();`,
        });
      }
      return route.abort();
    });
    await page.goto(`${base}/markets`);
    await page.waitForFunction((lang) => document.documentElement.lang === lang, lang);
    await page.locator('[data-tv-widget="ticker-tape"] iframe').waitFor();
    const legacy = page.locator('[class~="group/tick"]');
    assert.equal(await legacy.count(), 10, "only protected five, duplicated for marquee");
    const legacyText = (await legacy.allTextContents()).join(" ");
    for (const symbol of ["BRENT", "WTI", "NATGAS", "GOLD", "SILVER"])
      assert.match(legacyText, new RegExp(symbol));
    for (const symbol of ["COPPER", "ALU", "WHEAT", "CORN", "COCOA"])
      assert.doesNotMatch(legacyText, new RegExp(symbol));
    assert.ok(feedRequests > 0);
    const ticker = await page.evaluate(
      () => window.__tvTests.find((e) => e.config.symbols[0]?.proName)?.config,
    );
    assert.deepEqual(
      ticker.symbols.map((s) => s.proName),
      expected,
    );
    assert.equal(ticker.locale, lang);
    await page.locator('[data-desk="metals"]').click();
    for (const commodity of ["COPPER", "ALU"]) {
      const widget = page.locator(`[data-tv-commodity="${commodity}"]`);
      await widget.scrollIntoViewIfNeeded();
      await widget.locator("iframe").waitFor();
      assert.equal(await widget.locator("script").count(), 1);
      assert.equal(await widget.locator(".tradingview-widget-copyright").count(), 1);
      assert.equal(
        await widget.locator('a[href^="https://www.tradingview.com/symbols/CAPITALCOM-"]').count(),
        2,
      );
    }
    // The protected GOLD/SILVER cards still use their original SVG chart renderer.
    assert.equal(await page.locator("article svg.chart-draw").count(), 0); // chart-draw is a path, not SVG
    assert.equal(await page.locator("article path.chart-draw").count(), 2);
    await page.locator('[data-desk="ag"]').click();
    assert.equal(await page.locator('[data-tv-commodity="COPPER"]').count(), 0);
    for (const commodity of ["WHEAT", "CORN", "COCOA"]) {
      const widget = page.locator(`[data-tv-commodity="${commodity}"]`);
      await widget.scrollIntoViewIfNeeded();
      await widget.locator("iframe").waitFor();
      assert.equal(await widget.locator("script").count(), 1);
    }
    assert.equal(await page.locator("article path.chart-flat").count(), 0);
    assert.equal(await page.locator("article path.chart-draw").count(), 0);
    const articles = (await page.locator("article").allTextContents()).join(" ");
    assert.doesNotMatch(articles, /562\.25|418\.50|6,840|USD\/t|USc\/bu/);
    assert.match(articles, /CFD/);
    assert.match(articles, lang === "fr" ? /délai possible/ : /potentially delayed/);
    const otherLang = lang === "en" ? "fr" : "en";
    await page
      .locator("header button")
      .filter({ hasText: new RegExp(`^${otherLang}$`) })
      .click();
    await page.waitForFunction(
      (lang) =>
        [...document.querySelectorAll("[data-tv-widget] script")].every(
          (s) => JSON.parse(s.textContent).locale === lang,
        ),
      otherLang,
    );
    assert.equal(await page.locator('[data-tv-widget="ticker-tape"] script').count(), 1);
    for (const commodity of ["WHEAT", "CORN", "COCOA"])
      assert.equal(await page.locator(`[data-tv-commodity="${commodity}"] script`).count(), 1);
    // Known network failure: no synthetic prices; actual fallback links remain.
    blockedWidgets = true;
    await page.reload();
    await page.locator('[data-tv-widget="ticker-tape"] [role="status"]').waitFor();
    await page.locator('[data-desk="ag"]').click();
    for (const commodity of ["WHEAT", "CORN", "COCOA"]) {
      const widget = page.locator(`[data-tv-commodity="${commodity}"]`);
      await widget.scrollIntoViewIfNeeded();
      await widget.locator('[role="status"]').waitFor();
      assert.equal(await widget.locator("[hidden]").count(), 1);
      const fallback = widget
        .locator('a[href^="https://www.tradingview.com/symbols/CAPITALCOM-"]')
        .last();
      await fallback.waitFor({ state: "visible" });
      assert.doesNotMatch(await widget.textContent(), /0\.00%|562\.25|418\.50|6,840/);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const widthsFit = await page.locator("[data-tv-widget]").evaluateAll((widgets) =>
      widgets.every((widget) => {
        const rect = widget.getBoundingClientRect();
        return rect.width > 0 && rect.left >= -1 && rect.right <= window.innerWidth + 1;
      }),
    );
    assert.equal(widthsFit, true, "new containers fit a 390px viewport");
    assert.equal(posts, 0, "no external submission in market tests");
    console.log(
      `${lang}: mapping/ticker, protected five, lazy charts, tab cleanup, language remount, script-block fallback passed (all providers mocked)`,
    );
    await page.close();
  }
} finally {
  await browser.close();
}
