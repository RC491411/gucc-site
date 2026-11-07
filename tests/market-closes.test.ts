import { test } from "node:test";
import assert from "node:assert/strict";
import { COMMODITIES, unavailableQuotes, formatChange, quoteView, closeSpread } from "../src/lib/markets.ts";
import { APPROVED_INSTRUMENTS, CLOSE_SNAPSHOT_URL, validateCloseSnapshot, fetchCloseSnapshot, priorSessions, exchangeToday, type TrustedInstrument } from "../src/lib/market-close-data.ts";

// Synthetic exchange schedule/source, NOT production market data or a real holiday calendar.
const now = new Date("2026-11-07T17:30:00Z");
const instrument: TrustedInstrument = {
  symbol: "WTI", instrumentId: "TEST-FIXED-CONTRACT", name: "Test instrument only", kind: "futures",
  exchange: "Test Exchange", contractCode: "TEST-DEC", continuous: false, timeZone: "America/New_York", currency: "USD",
  inputUnit: "USD/bbl", outputUnit: "USD/bbl", scale: 1,
  source: { id: "test-source", name: "Fixture source", url: "https://example.com/data", documentationUrl: "https://example.com/docs", redistributionVerified: true },
  calendar: { sourceUrl: "https://example.com/calendar", validFrom: "2026-11-01", validThrough: "2026-11-30", sessions: [
    { date: "2026-11-04", closedAt: "2026-11-04T22:00:00Z" },
    { date: "2026-11-05", closedAt: "2026-11-05T22:00:00Z" },
    { date: "2026-11-06", closedAt: "2026-11-06T22:00:00Z" },
    { date: "2026-11-09", closedAt: "2026-11-09T22:00:00Z" },
    { date: "2026-11-10", closedAt: "2026-11-10T22:00:00Z" },
  ] },
};
const observation = (sessionDate = "2026-11-06", price = 110) => ({
  kind: "session_close", final: true, sessionDate, instrumentId: instrument.instrumentId,
  sourceId: instrument.source.id, currency: "USD", unit: "USD/bbl", price,
  publishedAt: `${sessionDate}T22:05:00Z`,
});
const payload = () => ({ schemaVersion: 2, generatedAt: "2026-11-07T08:00:00Z", quotes: [{
  symbol: "WTI", close: observation(), previous: observation("2026-11-05", 100),
}] });
const validated = () => validateCloseSnapshot(payload(), now, [instrument]).WTI;
const commodity = COMMODITIES.find(c => c.symbol === "WTI")!;

test("all ten commodities fail closed; no defaults, fake zeros, source or invented history", () => {
  assert.equal(COMMODITIES.length, 10);
  assert.equal(APPROVED_INSTRUMENTS.length, 0);
  for (const c of COMMODITIES) {
    const q = unavailableQuotes()[c.symbol];
    assert.equal(q.price, null); assert.equal(q.change, null); assert.equal(q.previousPrice, null);
    assert.equal(q.source, null); assert.equal(q.sessionDate, null); assert.ok(!("history" in q));
    for (const lang of ["en", "fr"] as const) {
      const view = quoteView(c, q, lang); assert.equal(view.available, false); assert.equal(view.direction, 0);
      assert.ok(!view.change.includes("0.00%")); assert.equal(view.price, "—");
    }
  }
  assert.equal(validateCloseSnapshot(payload(), now).WTI.price, null, "fetched JSON cannot approve its own source");
});

test("verified close vs immediately preceding same-instrument close; dates remain internal", () => {
  const q = validated(); assert.equal(q.status, "verified"); assert.equal(q.price, 110); assert.equal(q.previousPrice, 100);
  assert.ok(Math.abs(q.change! - 10) < 1e-10); assert.equal(q.sessionDate, "2026-11-06");
  assert.equal(q.previousSessionDate, "2026-11-05"); assert.equal(q.source?.name, "Fixture source");
  assert.equal(q.unit, "USD/bbl"); assert.equal(q.exchange, "Test Exchange"); assert.equal(q.instrumentId, instrument.instrumentId);
  for (const lang of ["en", "fr"] as const) {
    const view = quoteView(commodity, q, lang); assert.equal(view.available, true); assert.equal(view.direction, 1);
    assert.equal(view.change, "+10.00%"); assert.ok(!/2026|11-06/.test(JSON.stringify(view)));
  }
});

for (const [label, input] of Object.entries({ missing: null, array: [], oldSchema: { schemaVersion: 1, quotes: [] }, oldIntraday: { data: { prices: [{ code: "WTI_USD", price: 99, change_24h: 0 }] } }, malformed: { schemaVersion: 2, quotes: "bad" } })) {
  test(`reject ${label} snapshot`, () => assert.equal(validateCloseSnapshot(input, now, [instrument]).WTI.price, null));
}

for (const [label, mutate] of [
  ["stale session", (p: any) => p.quotes[0].close.sessionDate = "2026-11-05"],
  ["today", (p: any) => p.quotes[0].close.sessionDate = "2026-11-07"],
  ["future session", (p: any) => p.quotes[0].close.sessionDate = "2026-11-09"],
  ["intraday", (p: any) => p.quotes[0].close.kind = "intraday"],
  ["settlement mislabeled as close", (p: any) => p.quotes[0].close.kind = "settlement"],
  ["provisional", (p: any) => p.quotes[0].close.final = false],
  ["wrong instrument", (p: any) => p.quotes[0].close.instrumentId = "DIFFERENT-CONTRACT"],
  ["wrong provider", (p: any) => p.quotes[0].close.sourceId = "other"],
  ["wrong currency", (p: any) => p.quotes[0].close.currency = "EUR"],
  ["wrong unit", (p: any) => p.quotes[0].close.unit = "USD/t"],
  ["numeric string", (p: any) => p.quotes[0].close.price = "110"],
  ["zero placeholder", (p: any) => p.quotes[0].close.price = 0],
  ["negative", (p: any) => p.quotes[0].close.price = -1],
  ["NaN", (p: any) => p.quotes[0].close.price = NaN],
  ["infinite", (p: any) => p.quotes[0].close.price = Infinity],
  ["published before session closed", (p: any) => p.quotes[0].close.publishedAt = "2026-11-06T21:00:00Z"],
  ["future publication", (p: any) => p.quotes[0].close.publishedAt = "2026-11-08T08:00:00Z"],
  ["future snapshot", (p: any) => p.generatedAt = "2026-11-08T08:00:00Z"],
  ["timestamp without zone", (p: any) => p.generatedAt = "2026-11-07T08:00:00"],
  ["invalid timestamp date", (p: any) => p.generatedAt = "2026-02-31T08:00:00Z"],
  ["snapshot predates source publication", (p: any) => p.generatedAt = "2026-11-06T21:00:00Z"],
  ["duplicate commodity", (p: any) => p.quotes.push(p.quotes[0])],
] as const) {
  test(`reject ${label}`, () => { const p = payload(); mutate(p); assert.equal(validateCloseSnapshot(p, now, [instrument]).WTI.price, null); });
}

test("a genuinely completed session today is still excluded", () => {
  const p = payload(); p.generatedAt = "2026-11-06T23:00:00Z";
  assert.equal(validateCloseSnapshot(p, new Date("2026-11-06T23:30:00Z"), [instrument]).WTI.price, null);
});

test("weekends use Friday; exchange-local calendar not browser/Zurich day", () => {
  for (const date of ["2026-11-07T12:00:00Z", "2026-11-08T12:00:00Z", "2026-11-09T12:00:00Z"]) {
    assert.equal(priorSessions(instrument, new Date(date))?.[0].date, "2026-11-06");
  }
  assert.equal(exchangeToday(new Date("2026-11-07T00:30:00Z"), "America/New_York"), "2026-11-06");
  assert.equal(priorSessions(instrument, new Date("2026-11-07T00:30:00Z"))?.[0].date, "2026-11-05");
});

test("holiday/early close selection follows explicit approved calendar, never guessed weekdays", () => {
  const c = structuredClone(instrument);
  c.calendar.sessions = c.calendar.sessions.filter(s => s.date !== "2026-11-09"); // Synthetic Monday holiday.
  c.calendar.sessions.find(s => s.date === "2026-11-06")!.closedAt = "2026-11-06T18:00:00Z";
  assert.equal(priorSessions(c, new Date("2026-11-10T17:00:00Z"))?.[0].date, "2026-11-06");
  assert.equal(priorSessions(instrument, new Date("2026-11-10T17:00:00Z"))?.[0].date, "2026-11-09");
  assert.equal(validateCloseSnapshot(payload(), new Date("2026-11-10T17:00:00Z"), [instrument]).WTI.price, null);
});

for (const label of ["expired", "missing source", "invalid date", "duplicate session", "timezone", "continuous", "no contract", "unlicensed", "wrong output unit", "normalization overflow"] as const) {
  test(`fail closed on ${label} instrument/calendar configuration`, () => {
    const c = structuredClone(instrument);
    if (label === "expired") c.calendar.validThrough = "2026-11-06";
    if (label === "missing source") c.calendar.sourceUrl = "";
    if (label === "invalid date") c.calendar.sessions[0].date = "2026-02-31";
    if (label === "duplicate session") c.calendar.sessions.push(c.calendar.sessions[0]);
    if (label === "timezone") c.timeZone = "invalid";
    if (label === "continuous") c.continuous = true;
    if (label === "no contract") c.contractCode = null;
    if (label === "unlicensed") c.source.redistributionVerified = false;
    if (label === "wrong output unit") c.outputUnit = "USD/t";
    if (label === "normalization overflow") c.scale = Number.MAX_VALUE;
    assert.equal(validateCloseSnapshot(payload(), now, [c]).WTI.price, null);
  });
}

for (const label of ["absent", "wrong preceding session", "rollover", "wrong unit", "unfinalized"] as const) {
  test(`missing/invalid baseline (${label}) means null change, never 0`, () => {
    const p: any = payload();
    if (label === "absent") delete p.quotes[0].previous;
    if (label === "wrong preceding session") p.quotes[0].previous.sessionDate = "2026-11-04";
    if (label === "rollover") p.quotes[0].previous.instrumentId = "NEXT-CONTRACT";
    if (label === "wrong unit") p.quotes[0].previous.unit = "USD/t";
    if (label === "unfinalized") p.quotes[0].previous.final = false;
    const q = validateCloseSnapshot(p, now, [instrument]).WTI;
    assert.equal(q.price, 110); assert.equal(q.change, null); assert.equal(q.previousPrice, null);
    assert.equal(quoteView(commodity, q, "en").direction, 0);
    assert.equal(quoteView(commodity, q, "en").change, "Change unavailable");
  });
}

test("true zero is distinct from absent and neutral; nonzero rounded moves do not become +0.00%", () => {
  const p = payload(); p.quotes[0].close.price = 100;
  const q = validateCloseSnapshot(p, now, [instrument]).WTI;
  assert.equal(q.change, 0); assert.equal(formatChange(q.change), "0.00%");
  assert.equal(quoteView(commodity, q, "fr").direction, 0);
  assert.equal(formatChange(null), "—"); assert.equal(formatChange(NaN), "—");
  assert.equal(formatChange(0.001), "+<0.01%"); assert.equal(formatChange(-0.001), "−<0.01%");
});

test("delayed next-day source publication accepted only for the correct finished session", () => {
  const p = payload(); p.quotes[0].close.publishedAt = "2026-11-07T07:30:00Z";
  assert.equal(validateCloseSnapshot(p, now, [instrument]).WTI.price, 110);
});

test("explicit currency/unit normalization applies to both closes before change; no guessed conversion", () => {
  const c = structuredClone(instrument); c.symbol = "WHEAT"; c.inputUnit = "USD/bu"; c.outputUnit = "USc/bu"; c.scale = 100;
  const p = payload(); p.quotes[0].symbol = "WHEAT";
  p.quotes[0].close.unit = "USD/bu"; p.quotes[0].close.price = 6;
  p.quotes[0].previous.unit = "USD/bu"; p.quotes[0].previous.price = 5;
  const q = validateCloseSnapshot(p, now, [c]).WHEAT;
  assert.equal(q.price, 600); assert.equal(q.previousPrice, 500); assert.ok(Math.abs(q.change! - 20) < 1e-10);
});

test("spread requires same session/currency/unit and two available closes", () => {
  const a = validated(); const b = { ...a, price: 90 };
  assert.equal(closeSpread(a, b), 20);
  assert.equal(closeSpread(a, { ...b, sessionDate: "2026-11-05" }), null);
  assert.equal(closeSpread(a, { ...b, unit: "USD/t" }), null);
  assert.equal(closeSpread(a, { ...b, currency: "EUR" }), null);
  assert.equal(closeSpread(a, unavailableQuotes().WTI), null);
});

for (const mode of ["success", "http", "non-json", "network", "timeout"] as const) {
  test(`snapshot GET ${mode}: no intraday endpoint, retry, or legacy cache fallback`, async () => {
    let calls = 0;
    const fetcher = (async (url, init) => {
      calls++; assert.equal(url, CLOSE_SNAPSHOT_URL); assert.equal(init?.cache, "no-store");
      if (mode === "network") throw new TypeError("offline");
      if (mode === "timeout") return new Promise(() => {});
      if (mode === "http") return new Response("no", { status: 500 });
      if (mode === "non-json") return new Response("<html>no</html>");
      return Response.json({ schemaVersion: 2, generatedAt: null, quotes: [] });
    }) as typeof fetch;
    const result = await fetchCloseSnapshot(fetcher, 10);
    assert.equal(calls, 1);
    if (mode === "success") assert.deepEqual(result, { schemaVersion: 2, generatedAt: null, quotes: [] });
    else assert.equal(result, null);
    assert.equal(validateCloseSnapshot(result, now).WTI.price, null);
  });
}
