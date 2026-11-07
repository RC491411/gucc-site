/** No default prices: an unverified close is unavailable, never zero. */
export type Commodity = {
  symbol: string;
  nameFr: string;
  nameEn: string;
  /** Quotation unit required when an instrument is approved, not a current quote. */
  unit: string;
  desk: "energy" | "metals" | "ag";
  decimals: number;
};

export const COMMODITIES: Commodity[] = [
  { symbol: "BRENT", nameFr: "Brent", nameEn: "Brent Crude", unit: "USD/bbl", desk: "energy", decimals: 2 },
  { symbol: "WTI", nameFr: "WTI", nameEn: "WTI Crude", unit: "USD/bbl", desk: "energy", decimals: 2 },
  { symbol: "NATGAS", nameFr: "Gaz naturel", nameEn: "Natural Gas", unit: "USD/MMBtu", desk: "energy", decimals: 3 },
  { symbol: "GOLD", nameFr: "Or", nameEn: "Gold", unit: "USD/troy oz", desk: "metals", decimals: 2 },
  { symbol: "SILVER", nameFr: "Argent", nameEn: "Silver", unit: "USD/troy oz", desk: "metals", decimals: 2 },
  { symbol: "COPPER", nameFr: "Cuivre", nameEn: "Copper", unit: "USD/t", desk: "metals", decimals: 2 },
  { symbol: "ALU", nameFr: "Aluminium", nameEn: "Aluminium", unit: "USD/t", desk: "metals", decimals: 2 },
  { symbol: "WHEAT", nameFr: "Blé", nameEn: "Wheat", unit: "USc/bu", desk: "ag", decimals: 2 },
  { symbol: "CORN", nameFr: "Maïs", nameEn: "Corn", unit: "USc/bu", desk: "ag", decimals: 2 },
  { symbol: "COCOA", nameFr: "Cacao", nameEn: "Cocoa", unit: "USD/t", desk: "ag", decimals: 2 },
];

export type Quote = {
  symbol: string;
  price: number | null;
  previousPrice: number | null;
  change: number | null;
  status: "verified" | "unavailable";
  reason: string;
  // Session dates/timestamps are internal validation data, deliberately not UI labels.
  sessionDate: string | null;
  previousSessionDate: string | null;
  publishedAt: string | null;
  snapshotAt: string | null;
  instrumentId: string | null;
  instrumentName: string | null;
  instrumentKind: "spot" | "futures" | null;
  exchange: string | null;
  currency: string | null;
  unit: string | null;
  source: { name: string; url: string } | null;
};

export const MARKET_COPY = {
  unavailable: { fr: "Clôture indisponible", en: "Close unavailable" },
  previousClose: { fr: "Clôture de la séance précédente", en: "Previous-session close" },
  changeUnavailable: { fr: "Variation indisponible", en: "Change unavailable" },
  comparisonUnavailable: { fr: "Comparaison de clôtures indisponible", en: "Close comparison unavailable" },
  sourceUnavailable: { fr: "Source de clôture et instrument non vérifiés. Aucun prix affiché.", en: "Closing-price source and instrument not verified. No price displayed." },
  source: { fr: "Source", en: "Source" },
  futures: { fr: "Contrat à terme", en: "Futures contract" },
  spot: { fr: "Comptant", en: "Spot" },
  previous: { fr: "Séance antérieure", en: "Preceding session" },
  selected: { fr: "Clôture retenue", en: "Selected close" },
};

export function unavailableQuotes(reason = "no_verified_source"): Record<string, Quote> {
  return Object.fromEntries(COMMODITIES.map(({ symbol }) => [symbol, {
    symbol, price: null, previousPrice: null, change: null, status: "unavailable", reason,
    sessionDate: null, previousSessionDate: null, publishedAt: null, snapshotAt: null, instrumentId: null, instrumentName: null,
    instrumentKind: null, exchange: null, currency: null, unit: null, source: null,
  }]));
}

export function formatPrice(value: number, decimals: number) {
  return Number.isFinite(value) ? value.toLocaleString("en-US", {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  }) : "—";
}

export function formatChange(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—";
  if (value === 0) return "0.00%";
  // Do not round a genuine small move into the misleading +0.00%.
  if (Math.abs(value) < 0.005) return `${value > 0 ? "+" : "−"}<0.01%`;
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function quoteView(c: Commodity, q: Quote | undefined, lang: "fr" | "en") {
  const available = q?.status === "verified" && q.price !== null && Number.isFinite(q.price);
  const change = available && q.change !== null && Number.isFinite(q.change) ? q.change : null;
  return {
    available,
    price: available ? formatPrice(q.price!, c.decimals) : "—",
    change: change === null ? MARKET_COPY.changeUnavailable[lang] : formatChange(change),
    direction: change === null || change === 0 ? 0 : change > 0 ? 1 : -1,
    status: available ? MARKET_COPY.previousClose[lang] : MARKET_COPY.unavailable[lang],
  };
}

export function closeSpread(a: Quote | undefined, b: Quote | undefined): number | null {
  return a?.status === "verified" && b?.status === "verified" &&
    a.price !== null && b.price !== null && Number.isFinite(a.price) && Number.isFinite(b.price) &&
    a.sessionDate !== null && a.currency !== null && a.unit !== null && a.sessionDate === b.sessionDate &&
    a.currency === b.currency && a.unit === b.unit ? a.price - b.price : null;
}
