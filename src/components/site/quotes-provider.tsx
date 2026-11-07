import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { applyLiveRows, LIVE_FEED_URL, referenceQuotes, type LiveRow, type Quote } from "@/lib/markets";

const QuotesContext = createContext<Record<string, Quote>>(referenceQuotes());
const CACHE_KEY = "gucc-live-quotes-v1";
const TTL_MS = 4 * 60 * 60 * 1000;

type Cache = { fetchedAt: number; rows: LiveRow[] };

function readCache(): Cache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cache;
    if (!parsed?.fetchedAt || !Array.isArray(parsed.rows)) return null;
    if (Date.now() - parsed.fetchedAt > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function QuotesProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>(referenceQuotes);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setQuotes(applyLiveRows(cached.rows));
      return;
    }

    const controller = new AbortController();
    fetch(LIVE_FEED_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("quote feed");
        return res.json() as Promise<{ data?: { prices?: LiveRow[] } }>;
      })
      .then((body) => {
        const rows = body.data?.prices ?? [];
        if (!rows.length) return;
        localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), rows }));
        setQuotes(applyLiveRows(rows));
      })
      .catch(() => {
        /* keep reference levels if the feed is unavailable */
      });

    return () => controller.abort();
  }, []);

  return <QuotesContext.Provider value={quotes}>{children}</QuotesContext.Provider>;
}

export function useQuotes() {
  return useContext(QuotesContext);
}
