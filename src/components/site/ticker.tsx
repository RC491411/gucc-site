import { useEffect, useMemo, useRef } from "react";
import { useLanguage } from "@/lib/language";
import { COMMODITIES, formatChange, formatPrice, type Quote } from "@/lib/markets";
import { ensureGsap, prefersReducedMotion, scrollState } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Ticker({ quotes }: { quotes: Record<string, Quote> }) {
  const { t } = useLanguage();
  const track = useRef<HTMLDivElement>(null);

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

  // Marquee driven by GSAP: speeds up with scroll velocity, slows on hover.
  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const tween = gsap.fromTo(el, { xPercent: 0 }, { xPercent: -50, ease: "none", duration: 42, repeat: -1 });
    let hover = false;
    const onEnter = () => (hover = true);
    const onLeave = () => (hover = false);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    const tick = () => {
      const boost = Math.min(Math.abs(scrollState.velocity) / 5, 6);
      const target = hover ? 0.15 : 1 + boost;
      tween.timeScale(gsap.utils.interpolate(tween.timeScale(), target, 0.06));
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      tween.kill();
    };
  }, []);

  const row = (copy: string) => (
    <div className="flex items-center" aria-hidden={copy === "b"}>
      {items.map((item) => (
        <div
          key={item.symbol + copy}
          className="group/tick flex items-baseline gap-3 px-6 font-mono text-xs tracking-wide"
        >
          <span
            aria-hidden
            className={cn(
              "inline-block size-0 self-center border-x-[4px] border-x-transparent",
              item.up ? "border-b-[6px] border-b-up" : "border-t-[6px] border-t-down",
            )}
          />
          <span className="text-steel transition-colors duration-[var(--motion-quick)] group-hover/tick:text-wheat">{item.symbol}</span>
          <span className="tick-flash tabular-nums text-paper">{item.price}</span>
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
        <div ref={track} className="flex w-max will-change-transform">
          {row("a")}
          {row("b")}
        </div>
      </div>
      <p className="sr-only">{t.tickerNote}</p>
    </div>
  );
}
