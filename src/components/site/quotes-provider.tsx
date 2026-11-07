import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { unavailableQuotes, type Quote } from "@/lib/markets";
import { fetchCloseSnapshot, validateCloseSnapshot } from "@/lib/market-close-data";

const QuotesContext = createContext<Record<string, Quote>>(unavailableQuotes());

export function QuotesProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>(unavailableQuotes);
  useEffect(() => {
    let active = true;
    let pending = false;
    let snapshot: unknown = null;
    // Invalidate the incompatible old intraday/reference cache. Never read it.
    try { localStorage.removeItem("gucc-live-quotes-v1"); } catch { /* storage is optional */ }
    const validate = () => {
      if (active) setQuotes(validateCloseSnapshot(snapshot));
    };
    const refresh = async () => {
      if (pending) return;
      pending = true;
      snapshot = await fetchCloseSnapshot();
      pending = false;
      validate(); // A failed fetch clears quotes; it cannot resurrect an old price.
    };
    void refresh();
    const fetchTimer = window.setInterval(() => { void refresh(); }, 15 * 60_000);
    // An open tab must fail closed when the required exchange session changes.
    const validationTimer = window.setInterval(validate, 60_000);
    const onVisibility = () => { if (document.visibilityState === "visible") { validate(); void refresh(); } };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false;
      window.clearInterval(fetchTimer);
      window.clearInterval(validationTimer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return <QuotesContext.Provider value={quotes}>{children}</QuotesContext.Provider>;
}

export function useQuotes() { return useContext(QuotesContext); }
