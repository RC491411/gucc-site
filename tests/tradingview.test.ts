import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  TRADINGVIEW_INSTRUMENTS,
  isTradingViewCommodity,
  overviewConfig,
  tradingViewUrl,
  mountTradingViewWidget,
  WIDGET_COPY,
} from "../src/lib/tradingview.ts";
import { COMMODITIES, applyLiveRows, LIVE_FEED_URL } from "../src/lib/markets.ts";

const expected = [
  "CAPITALCOM:XCUUSD",
  "CAPITALCOM:ALUMINUM",
  "CAPITALCOM:WHEAT",
  "CAPITALCOM:CORN",
  "CAPITALCOM:COCOA",
];
const targets = Object.keys(TRADINGVIEW_INSTRUMENTS) as (keyof typeof TRADINGVIEW_INSTRUMENTS)[];
const protectedSymbols = ["BRENT", "WTI", "NATGAS", "GOLD", "SILVER"];
const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const hash = (s: string) => createHash("sha256").update(s).digest("hex");

test("only the exact five browser-validated CFD instruments use widgets", () => {
  assert.deepEqual(
    Object.values(TRADINGVIEW_INSTRUMENTS).map((i) => i.symbol),
    expected,
  );
  for (const key of targets) assert.equal(isTradingViewCommodity(key), true);
  for (const key of [...protectedSymbols, "__proto__", "toString", "unknown", ""])
    assert.equal(isTradingViewCommodity(key), false);
});

test("EN/FR charts keep native provider values, percent and history, no guessed units or dates", () => {
  for (const lang of ["en", "fr"] as const) {
    for (const [index, key] of targets.entries()) {
      const config = overviewConfig(key, lang);
      assert.equal(config.symbols[0][1], `${expected[index]}|1D`);
      assert.equal(config.locale, lang);
      assert.equal(config.chartOnly, false);
      assert.equal(config.changeMode, "price-and-percent");
      assert.equal(config.noTimeScale, true);
      assert.equal(config.hideDateRanges, true);
      assert.doesNotMatch(
        JSON.stringify(config),
        /USD\/|USc\/|price":|history":|access_key|token/i,
      );
      assert.match(tradingViewUrl(key), /^https:\/\/www\.tradingview\.com\/symbols\/CAPITALCOM-/);
    }
    assert.match(WIDGET_COPY[lang].status, /CFD/);
    assert.match(WIDGET_COPY[lang].status, /delayed|délai/);
    assert.doesNotMatch(WIDGET_COPY[lang].status, /previous|veille|real.time|temps réel/);
    assert.ok(WIDGET_COPY[lang].fallback);
  }
});

class FakeDocument {
  createElement(tagName: string): FakeNode {
    return new FakeNode(tagName, this);
  }
}
class FakeNode {
  tagName: string;
  ownerDocument: FakeDocument;
  parent: FakeNode | null = null;
  children: FakeNode[] = [];
  style: Record<string, string> = {};
  className = "";
  href = "";
  rel = "";
  target = "";
  type = "";
  async = false;
  src = "";
  textContent = "";
  onerror: (() => void) | null = null;
  constructor(tagName: string, ownerDocument: FakeDocument) {
    this.tagName = tagName;
    this.ownerDocument = ownerDocument;
  }
  append(...nodes: FakeNode[]) {
    for (const node of nodes) {
      node.remove();
      node.parent = this;
      this.children.push(node);
    }
  }
  remove() {
    if (this.parent) {
      this.parent.children = this.parent.children.filter((n) => n !== this);
      this.parent = null;
    }
  }
  replaceChildren(...nodes: FakeNode[]) {
    for (const node of [...this.children]) node.remove();
    this.append(...nodes);
  }
}
const scripts = (host: FakeNode): FakeNode[] =>
  host.children.flatMap((child) => (child.tagName === "script" ? [child] : scripts(child)));

test("StrictMode setup/cleanup/setup leaves one isolated script and attribution; late errors ignored", () => {
  const host = new FakeDocument().createElement("host");
  let errors = 0;
  const mount = () =>
    mountTradingViewWidget(
      host as unknown as HTMLElement,
      "symbol-overview",
      overviewConfig("COPPER", "en"),
      tradingViewUrl("COPPER"),
      "Copper CFD",
      () => errors++,
    );
  const dispose = mount();
  const first = scripts(host)[0];
  assert.equal(first.async, true);
  assert.equal(
    first.src,
    "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js",
  );
  assert.deepEqual(JSON.parse(first.textContent), overviewConfig("COPPER", "en"));
  assert.equal(host.children[0].children[1].className, "tradingview-widget-copyright");
  assert.equal(host.children[0].children[1].children[1].textContent, " by TradingView");
  const lateError = first.onerror!;
  dispose();
  assert.equal(host.children.length, 0);
  assert.equal(first.onerror, null);
  lateError();
  assert.equal(errors, 0);
  const dispose2 = mount();
  assert.equal(host.children.length, 1);
  assert.equal(scripts(host).length, 1);
  scripts(host)[0].onerror!();
  assert.equal(errors, 1);
  dispose2();
  dispose2();
  assert.equal(host.children.length, 0);
});

test("old cleanup cannot remove replacement after language or route change", () => {
  const host = new FakeDocument().createElement("host");
  const old = mountTradingViewWidget(
    host as unknown as HTMLElement,
    "symbol-overview",
    overviewConfig("COPPER", "en"),
    tradingViewUrl("COPPER"),
    "CFDs",
    () => {},
  );
  const current = mountTradingViewWidget(
    host as unknown as HTMLElement,
    "symbol-overview",
    overviewConfig("COPPER", "fr"),
    tradingViewUrl("COPPER"),
    "CFD",
    () => {},
  );
  old();
  assert.equal(scripts(host).length, 1);
  assert.equal(JSON.parse(scripts(host)[0].textContent).locale, "fr");
  current();
  assert.equal(host.children.length, 0);
});

test("working five feed/cache/reference and exact original card/chart implementation remain byte-identical", () => {
  assert.equal(
    hash(source("src/lib/markets.ts")),
    "88c2bb494d65cbb747cc6d9b274c75bb4ae71d4427bdc5f2a8c70b0338626d1d",
  );
  assert.equal(
    hash(source("src/components/site/quotes-provider.tsx")),
    "c5d8340a06952257d41fe9e717f64d18dd79604d3e7aa8c831c6316bf394708f",
  );
  const cards = source("src/components/pages/markets-page.tsx");
  assert.equal(
    hash(cards.slice(cards.indexOf("function CommodityCard("))),
    "32b9e4358729383316b247a9b4838c0484e1cc27c040b6907a4aa60347ec3c6b",
  );
  assert.deepEqual(
    COMMODITIES.filter((c) => c.liveCode).map((c) => c.symbol),
    protectedSymbols,
  );
  assert.equal(
    LIVE_FEED_URL,
    "https://api.oilpriceapi.com/v1/demo/prices?codes=BRENT_CRUDE_USD,WTI_USD,NATURAL_GAS_USD,GOLD_USD,SILVER_USD",
  );
  const quotes = applyLiveRows([{ code: "BRENT_CRUDE_USD", price: 80, change_24h: 2 }]);
  assert.equal(quotes.BRENT.price, 80);
  assert.equal(quotes.BRENT.change, 2);
  assert.equal(quotes.BRENT.history.length, 16);
});

test("targets bypass legacy prices/history in both renderers, including stale quote records", () => {
  const ticker = source("src/components/site/ticker.tsx");
  assert.match(ticker, /COMMODITIES\.filter\(\(c\) => c\.liveCode\)\.map/);
  assert.doesNotMatch(ticker, /TradingViewTargetsTicker|tradingview-widget/);
  const cards = source("src/components/pages/markets-page.tsx");
  assert.match(cards, /board\.map\(\(c, i\) => isTradingViewCommodity\(c\.symbol\) \?/);
  const widgets = source("src/components/markets/tradingview-widget.tsx");
  assert.doesNotMatch(
    widgets,
    /useQuotes|formatPrice|formatChange|c\.unit|q\?\.price|referenceQuotes/,
  );
  assert.match(widgets, /observer\.disconnect\(\)/);
  assert.match(widgets, /copy\.fallback/);
  assert.match(widgets, /hidden=\{failed\}/);
  assert.doesNotMatch(
    source("src/lib/tradingview.ts"),
    /fetch\(|postMessage\(|contentDocument|contentWindow|localStorage/,
  );
});

// The requested removal must not change either retained renderer.
test("original upper ticker and five retained TradingView card shells are unchanged", () => {
  assert.equal(
    hash(source("src/components/site/ticker.tsx")),
    "07a0659abb8fdc9ccc99efb7136a7cecd196ea5bcaaec1a8cb6aec076a7aa7e8",
  );
  const widgetSource = source("src/components/markets/tradingview-widget.tsx");
  const card = widgetSource
    .slice(widgetSource.indexOf("export function TradingViewCommodityCard("))
    .trim();
  assert.equal(hash(card), "34381583b0307cbdf4e42d75f71f548a3246800b30cb18e3cf449fa7282b8bac");
  assert.doesNotMatch(widgetSource, /TradingViewTargetsTicker|ticker-tape|tickerConfig/);
  assert.doesNotMatch(source("src/lib/tradingview.ts"), /ticker-tape|tickerConfig/);
});
