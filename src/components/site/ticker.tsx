import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/language";
import { COMMODITIES, formatChange, formatPrice, type Quote } from "@/lib/markets";
import { cn } from "@/lib/utils";

export function Ticker({ quotes }: { quotes: Record<string, Quote> }) {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = useMemo(
    () =>
      COMMODITIES.map((c) => {
        const q = quotes[c.symbol];
        return {
          symbol: c.symbol,
          unit: c.unit,
          price: q ? formatPrice(q.price, c.decimals) : "—",
          change: q ? formatChange(q.change) : "0.00%",
          up: (q?.change ?? 0) >= 0,
        };
      }),
    [quotes],
  );

  const row = (
    <div className="flex items-center">
      {items.map((item) => (
        <div
          key={item.symbol + "-a"}
          className="flex items-baseline gap-3 px-6 font-mono text-xs tracking-wide"
        >
          <span className="text-steel">{item.symbol}</span>
          <span className="tabular-nums text-paper">{item.price}</span>
          <span className={cn("tabular-nums", item.up ? "text-up" : "text-down")}>{item.change}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative border-b border-paper/10 bg-ink">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink to-transparent" />
      <div className="overflow-hidden py-2.5">
        <div className={cn("flex w-max", mounted && "ticker-track")}>
          {row}
          {row}
        </div>
      </div>
      <p className="sr-only">{t.tickerNote}</p>
    </div>
  );
}
