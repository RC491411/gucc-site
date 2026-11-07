import { COMMODITIES, unavailableQuotes, type Quote } from "./markets.ts";

export type Session = { date: string; closedAt: string };
export type TrustedInstrument = {
  symbol: string;
  instrumentId: string; // Fixed maturity/prompt for futures, never an ambiguous front-month code.
  name: string;
  kind: "spot" | "futures";
  exchange: string;
  /** Required fixed contract code/prompt for futures; continuous/rolling series are not approved. */
  contractCode: string | null;
  continuous: boolean;
  timeZone: string;
  currency: string;
  inputUnit: string;
  outputUnit: string;
  scale: number; // Explicit normalization approved for this source/instrument, never guessed.
  source: { id: string; name: string; url: string; documentationUrl: string; redistributionVerified: boolean };
  calendar: {
    sourceUrl: string;
    validFrom: string;
    validThrough: string;
    /** Explicit exchange session schedule, including holidays/early closes. Not a weekday guess. */
    sessions: Session[];
  };
};

/** EMPTY BY DESIGN. No researched source yet meets close + identity + calendar + public-use requirements.
 * Do not populate from the fetched JSON. A new adapter requires a reviewed source/contract/calendar.
 */
export const APPROVED_INSTRUMENTS: readonly TrustedInstrument[] = [];
export const CLOSE_SNAPSHOT_URL = "/data/market-closes.v2.json";
export const CLOSE_SCHEMA_VERSION = 2;
const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const dateOnly = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;
const instant = (s: unknown): number => typeof s === "string" && dateOnly(s.slice(0, 10)) &&
  /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(s) ? Date.parse(s) : NaN;

export function exchangeToday(now: Date, timeZone: string): string {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (key: string) => p.find(v => v.type === key)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function priorSessions(config: TrustedInstrument, now: Date): [Session, Session | null] | null {
  try {
    const today = exchangeToday(now, config.timeZone);
    const c = config.calendar;
    if (!dateOnly(c.validFrom) || !dateOnly(c.validThrough) || c.validFrom > today || c.validThrough < today ||
      !c.sourceUrl.startsWith("https://") || !Array.isArray(c.sessions)) return null;
    const dates = new Set<string>();
    for (const s of c.sessions) {
      if (!dateOnly(s.date) || dates.has(s.date) || s.date < c.validFrom || s.date > c.validThrough ||
        !Number.isFinite(instant(s.closedAt)) || exchangeToday(new Date(s.closedAt), config.timeZone) !== s.date) return null;
      dates.add(s.date);
    }
    const sessions = c.sessions.filter(s => s.date < today && instant(s.closedAt) <= now.getTime())
      .sort((a, b) => b.date.localeCompare(a.date));
    return sessions.length ? [sessions[0], sessions[1] ?? null] : null;
  } catch { return null; }
}

function validObservation(row: unknown, expected: Session, config: TrustedInstrument, generated: number, now: Date): row is Record<string, unknown> & { price: number; publishedAt: string } {
  if (!isObject(row)) return false;
  const published = instant(row.publishedAt);
  return row.kind === "session_close" && row.final === true && row.sessionDate === expected.date &&
    row.instrumentId === config.instrumentId && row.sourceId === config.source.id &&
    row.currency === config.currency && row.unit === config.inputUnit &&
    typeof row.price === "number" && Number.isFinite(row.price) && row.price > 0 &&
    Number.isFinite(published) && published >= instant(expected.closedAt) && published <= generated &&
    published <= now.getTime();
}

/** Fail closed per instrument. No intraday, settlement-as-close, stale-session, rollover or guessed holiday data. */
export function validateCloseSnapshot(payload: unknown, now = new Date(), approved = APPROVED_INSTRUMENTS): Record<string, Quote> {
  const quotes = unavailableQuotes();
  if (!isObject(payload) || payload.schemaVersion !== CLOSE_SCHEMA_VERSION || !Array.isArray(payload.quotes)) return unavailableQuotes("invalid_snapshot");
  if (!payload.quotes.length) return quotes;
  const generated = instant(payload.generatedAt);
  if (!Number.isFinite(generated) || generated > now.getTime()) return unavailableQuotes("invalid_snapshot_timestamp");
  for (const c of COMMODITIES) {
    const configs = approved.filter(v => v.symbol === c.symbol);
    if (configs.length !== 1) continue;
    const config = configs[0];
    const sessions = priorSessions(config, now);
    if (!sessions || !config.instrumentId || !config.name || !config.exchange || config.continuous !== false ||
      (config.kind === "futures" && !config.contractCode) ||
      !["spot", "futures"].includes(config.kind) || !Number.isFinite(config.scale) || config.scale <= 0 ||
      config.outputUnit !== c.unit || !config.source.redistributionVerified ||
      !config.source.url.startsWith("https://") || !config.source.documentationUrl.startsWith("https://")) {
      quotes[c.symbol].reason = "unverified_instrument_or_calendar";
      continue;
    }
    const rows = payload.quotes.filter(v => isObject(v) && v.symbol === c.symbol);
    if (rows.length !== 1 || !isObject(rows[0])) { quotes[c.symbol].reason = "missing_or_duplicate_quote"; continue; }
    const row = rows[0];
    if (!validObservation(row.close, sessions[0], config, generated, now)) {
      quotes[c.symbol].reason = "unverified_or_wrong_session_close"; continue;
    }
    const price = row.close.price * config.scale;
    const previous = sessions[1] && validObservation(row.previous, sessions[1], config, generated, now) ? row.previous : null;
    const previousPrice = previous ? previous.price * config.scale : null;
    if (!Number.isFinite(price) || price <= 0 || (previousPrice !== null && (!Number.isFinite(previousPrice) || previousPrice <= 0))) continue;
    const percent = previousPrice === null ? null : (price / previousPrice - 1) * 100;
    const change = percent !== null && Number.isFinite(percent) ? percent : null;
    quotes[c.symbol] = {
      symbol: c.symbol, price, previousPrice, change, status: "verified", reason: "verified_session_close",
      sessionDate: sessions[0].date, previousSessionDate: previous ? sessions[1]!.date : null,
      publishedAt: row.close.publishedAt, snapshotAt: payload.generatedAt as string,
      instrumentId: config.instrumentId, instrumentName: config.name, instrumentKind: config.kind,
      exchange: config.exchange, currency: config.currency, unit: config.outputUnit,
      source: { name: config.source.name, url: config.source.url },
    };
  }
  return quotes;
}

/** Same-origin public snapshot, one GET, no API secret or previous intraday cache fallback. */
export async function fetchCloseSnapshot(fetcher: typeof fetch = fetch, timeoutMs = 10_000): Promise<unknown | null> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>(resolve => {
    timer = setTimeout(() => { controller.abort(); resolve(null); }, timeoutMs);
  });
  const request = async () => {
    try {
      const res = await fetcher(CLOSE_SNAPSHOT_URL, { cache: "no-store", signal: controller.signal });
      if (!res.ok) return null;
      return await res.json() as unknown;
    } catch { return null; }
  };
  try { return await Promise.race([request(), timeout]); }
  finally { clearTimeout(timer); }
}
