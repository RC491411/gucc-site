export type Commodity = {
  symbol: string;
  nameFr: string;
  nameEn: string;
  unit: string;
  desk: "energy" | "metals" | "ag";
  price: number;
  decimals: number;
  liveCode?: string;
};

export const COMMODITIES: Commodity[] = [
  { symbol: "BRENT", nameFr: "Brent", nameEn: "Brent Crude", unit: "USD/bbl", desk: "energy", price: 78.42, decimals: 2, liveCode: "BRENT_CRUDE_USD" },
  { symbol: "WTI", nameFr: "WTI", nameEn: "WTI Crude", unit: "USD/bbl", desk: "energy", price: 74.18, decimals: 2, liveCode: "WTI_USD" },
  { symbol: "NATGAS", nameFr: "Gaz naturel", nameEn: "Natural Gas", unit: "USD/mmBtu", desk: "energy", price: 3.26, decimals: 3, liveCode: "NATURAL_GAS_USD" },
  { symbol: "GOLD", nameFr: "Or", nameEn: "Gold", unit: "USD/oz", desk: "metals", price: 3648.2, decimals: 2, liveCode: "GOLD_USD" },
  { symbol: "SILVER", nameFr: "Argent", nameEn: "Silver", unit: "USD/oz", desk: "metals", price: 42, decimals: 2, liveCode: "SILVER_USD" },
  { symbol: "COPPER", nameFr: "Cuivre", nameEn: "Copper", unit: "USD/t", desk: "metals", price: 9714, decimals: 0 },
  { symbol: "ALU", nameFr: "Aluminium", nameEn: "Aluminium", unit: "USD/t", desk: "metals", price: 2528, decimals: 0 },
  { symbol: "WHEAT", nameFr: "Blé", nameEn: "Wheat", unit: "USc/bu", desk: "ag", price: 562.25, decimals: 2 },
  { symbol: "CORN", nameFr: "Maïs", nameEn: "Corn", unit: "USc/bu", desk: "ag", price: 418.5, decimals: 2 },
  { symbol: "COCOA", nameFr: "Cacao", nameEn: "Cocoa", unit: "USD/t", desk: "ag", price: 6840, decimals: 0 },
];

export type Quote = {
  symbol: string;
  price: number;
  change: number;
  history: number[];
  live: boolean;
};

export type LiveRow = {
  code: string;
  price: number;
  change_24h?: number;
};

const LIVE_CODES = COMMODITIES.map((c) => c.liveCode).filter((code): code is string => Boolean(code));

export const LIVE_FEED_URL = `https://api.oilpriceapi.com/v1/demo/prices?codes=${LIVE_CODES.join(",")}`;

function pathBetween(from: number, to: number, n = 16) {
  return Array.from({ length: n }, (_, i) => from + ((to - from) * i) / (n - 1));
}

export function referenceQuotes(): Record<string, Quote> {
  const out: Record<string, Quote> = {};
  for (const c of COMMODITIES) {
    out[c.symbol] = {
      symbol: c.symbol,
      price: c.price,
      change: 0,
      history: pathBetween(c.price, c.price),
      live: false,
    };
  }
  return out;
}

export function applyLiveRows(rows: LiveRow[]): Record<string, Quote> {
  const byCode = new Map(rows.map((row) => [row.code, row]));
  const out = referenceQuotes();
  for (const c of COMMODITIES) {
    if (!c.liveCode) continue;
    const row = byCode.get(c.liveCode);
    if (!row || !Number.isFinite(row.price)) continue;
    const change = Number.isFinite(row.change_24h) ? row.change_24h! : 0;
    const prev = change === -100 ? row.price : row.price / (1 + change / 100);
    out[c.symbol] = {
      symbol: c.symbol,
      price: row.price,
      change,
      history: pathBetween(prev, row.price),
      live: true,
    };
  }
  return out;
}

export function formatPrice(value: number, decimals: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatChange(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
