import { ArrowDownRight, ArrowUpRight, MapPin, Minus } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { SplitText } from "@/components/motion/split-text";
import { PageHero } from "@/components/pages/page-hero";
import { useQuotes } from "@/components/site/quotes-provider";
import { Reveal } from "@/components/site/reveal";
import { useLanguage } from "@/lib/language";
import { COMMODITIES, MARKET_COPY, closeSpread, quoteView, formatPrice, type Commodity, type Quote } from "@/lib/markets";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";
import { marketsPage as P } from "@/lib/pages";
import { cn } from "@/lib/utils";

type Desk = "energy" | "metals" | "ag";

export function MarketsPage() {
  const { lang } = useLanguage();
  useEffect(() => {
    document.title = P.meta[lang];
  }, [lang]);

  return (
    <div className="bg-ink text-paper">
      <PageHero
        index="03 / 06"
        kicker={P.kicker[lang]}
        title={P.title[lang]}
        lead={P.lead[lang]}
        visual={<MarketTerrain />}
      >
        <p className="mt-8 flex max-w-lg items-start gap-3 font-mono text-xs leading-relaxed text-steel">
          <span className="mt-1 size-2 shrink-0 rounded-full bg-steel" aria-hidden />
          {P.dataNote[lang]}
        </p>
      </PageHero>
      <MarketsDesk />
    </div>
  );
}

/** Decorative 3D trading floor: animated price curves running on a tilted grid. Not data. */
function MarketTerrain() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !isFinePointer() || prefersReducedMotion()) return;
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      el.style.setProperty("--mx", `${x * 18}deg`);
      el.style.setProperty("--my", `${y * 8}deg`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const curves = useMemo(
    () =>
      [0, 1, 2, 3, 4].map((k) => {
        const pts: string[] = [];
        for (let x = 0; x <= 400; x += 8) {
          const y =
            40 +
            k * 64 +
            Math.sin(x / (26 + k * 7) + k) * (14 + k * 2) +
            Math.sin(x / 9 + k * 3) * 4 +
            Math.cos(x / (61 - k * 5)) * 10;
          pts.push(`${x},${y.toFixed(1)}`);
        }
        return `M${pts.join(" L")}`;
      }),
    [],
  );
  const tones = ["text-copper", "text-wheat", "text-up", "text-ice", "text-copper"];
  const chips = [
    { s: "BRENT", x: "8%", y: "16%", z: 90 },
    { s: "GOLD", x: "62%", y: "8%", z: 140 },
    { s: "WHEAT", x: "70%", y: "62%", z: 70 },
    { s: "COPPER", x: "14%", y: "70%", z: 120 },
  ];

  return (
    <div
      ref={ref}
      aria-hidden
      className="market-terrain relative aspect-square w-[min(32rem,84vw)]"
    >
      <div className="market-plane absolute inset-[6%] rounded-3xl bg-navy/70 shadow-[0_0_0_1px_rgb(224_138_46_/_0.35),0_60px_120px_rgb(0_0_0_/_0.5)]">
        <div className="bg-grid absolute inset-0 rounded-3xl opacity-80" />
        <svg
          viewBox="0 0 400 360"
          className="absolute inset-0 size-full overflow-visible"
          preserveAspectRatio="none"
        >
          {curves.map((d, i) => (
            <g key={i} className={tones[i]}>
              <path
                d={d}
                className="terrain-glow"
                pathLength={1}
                style={{ "--d": `${i * 0.6}s` } as CSSProperties}
              />
              <path
                d={d}
                className="terrain-line"
                pathLength={1}
                style={{ "--d": `${i * 0.6}s` } as CSSProperties}
              />
            </g>
          ))}
        </svg>
        {chips.map((c, i) => (
          <span
            key={c.s}
            className="terrain-chip absolute rounded-md bg-ink/90 px-3 py-1.5 font-mono text-xs tracking-widest text-wheat shadow-[0_0_0_1px_rgb(242_193_75_/_0.5),0_20px_40px_rgb(0_0_0_/_0.5)]"
            style={
              { left: c.x, top: c.y, "--z": `${c.z}px`, "--d": `${i * -1.3}s` } as CSSProperties
            }
          >
            {c.s}
          </span>
        ))}
      </div>
    </div>
  );
}

function MarketsDesk() {
  const { t, lang } = useLanguage();
  const quotes = useQuotes();
  const [desk, setDesk] = useState<Desk>("energy");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const btn = tabsRef.current?.querySelector<HTMLElement>(`[data-desk="${desk}"]`);
      if (btn) setInd({ left: btn.offsetLeft, width: btn.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [desk, lang]);

  const deskInfo = t.markets.desks.find((d) => d.key === desk)!;
  const extra = P.desks[desk];
  const board = COMMODITIES.filter((c) => c.desk === desk);
  const brent = quotes.BRENT;
  const wti = quotes.WTI;
  const spread = closeSpread(brent, wti);

  const select = (d: Desk) => {
    setDesk(d);
    const top = document.getElementById("desk")?.getBoundingClientRect().top ?? 0;
    if (top < 0)
      document
        .getElementById("desk")
        ?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <section id="desk" className="scroll-mt-20 border-t border-copper/20 bg-ink">
      <div className="sticky top-20 z-20 border-b border-copper/15 bg-ink/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div
            ref={tabsRef}
            role="tablist"
            className="relative flex gap-1 rounded-lg bg-navy p-1 shadow-[0_0_0_1px_rgb(224_138_46_/_0.3)]"
          >
            <span
              aria-hidden
              className="absolute inset-y-1 rounded-md bg-copper transition-[left,width] duration-500 ease-[var(--ease-smooth-out)]"
              style={{ left: ind.left, width: ind.width }}
            />
            {t.markets.desks.map((d) => (
              <button
                key={d.key}
                type="button"
                role="tab"
                aria-selected={desk === d.key}
                data-desk={d.key}
                onClick={() => select(d.key as Desk)}
                className={cn(
                  "relative h-10 rounded-md px-3 font-display text-sm uppercase tracking-widest transition-colors duration-300 sm:px-5",
                  desk === d.key ? "text-ink" : "text-ice hover:text-wheat",
                )}
              >
                {d.title}
              </button>
            ))}
          </div>
          <span className="hidden items-center gap-2 font-mono text-xs uppercase tracking-widest text-steel sm:flex">
            <span className="size-2 rounded-full bg-steel" aria-hidden /> {MARKET_COPY.previousClose[lang]}
          </span>
        </div>
      </div>

      <div key={desk} className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="board-in">
            <p className="font-display text-xs uppercase tracking-widest text-copper">
              {t.markets.kicker}
            </p>
            <SplitText
              text={deskInfo.title}
              by="chars"
              immediate
              className="mt-3 font-display text-6xl font-semibold uppercase leading-none tracking-tight sm:text-8xl"
            />
            <p className="mt-6 max-w-xl font-serif text-lg leading-relaxed text-ice">
              {extra.lead[lang]}
            </p>
          </div>
          <aside
            data-tilt="8"
            style={{ animationDelay: "120ms" }}
            className="board-in glow-card relative overflow-hidden rounded-xl bg-navy p-6 shadow-[0_0_0_1px_rgb(224_138_46_/_0.35)] sm:p-8"
          >
            <MapPin className="absolute -right-4 -top-4 size-28 text-copper/10" />
            <p className="flex items-center gap-2 font-display text-xs uppercase tracking-widest text-wheat">
              <MapPin className="size-4" /> {P.whyGeneva[lang]}
            </p>
            <p className="relative mt-4 font-serif text-base leading-relaxed text-paper">
              {extra.geneva[lang]}
            </p>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-steel">
              46.20° N · 6.14° E
            </p>
          </aside>
        </div>

        <div
          className={cn("mt-14 grid gap-4 md:grid-cols-2", board.length === 3 && "lg:grid-cols-3")}
        >
          {board.map((c, i) => (
            <CommodityCard key={c.symbol} c={c} q={quotes[c.symbol]} delay={200 + i * 110} />
          ))}
        </div>

        {desk === "energy" && spread !== null ? (
          <div
            style={{ animationDelay: "600ms" }}
            className="market-spread board-in mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-navy px-6 py-5 shadow-[0_0_0_1px_rgb(224_138_46_/_0.22)]"
          >
            <span className="font-display text-sm uppercase tracking-widest text-wheat">
              {t.markets.spread}
            </span>
            <span className="font-mono text-2xl tabular-nums text-paper">
              {formatPrice(spread!, 2)}{" "}
              <span className="text-xs text-steel">USD/bbl</span>
            </span>
          </div>
        ) : null}

        <Reveal delay={200}>
          <p className="mt-10 max-w-2xl font-mono text-xs leading-relaxed text-steel">
            {P.dataNote[lang]}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function CommodityCard({ c, q, delay }: { c: Commodity; q?: Quote; delay: number }) {
  const { t, lang } = useLanguage();
  const view = quoteView(c, q, lang);
  const Arrow = view.direction === 0 ? Minus : view.direction > 0 ? ArrowUpRight : ArrowDownRight;
  const tone = view.direction > 0 ? "text-up" : view.direction < 0 ? "text-down" : "text-steel";
  return (
    <article data-tilt="7" style={{ animationDelay: `${delay}ms` }}
      className="commodity-card board-in glow-card group flex flex-col rounded-xl bg-navy p-6 shadow-[0_0_0_1px_rgb(224_138_46_/_0.22)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgb(242_193_75_/_0.5)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-3xl font-semibold uppercase tracking-tight text-wheat">{c.symbol}</p>
          <p className="mt-1 font-serif text-sm text-ice">{lang === "fr" ? c.nameFr : c.nameEn}</p>
        </div>
        <span className={cn("flex size-10 items-center justify-center rounded-full bg-paper/10", tone)}><Arrow className="size-5" /></span>
      </div>
      <p className="market-price mt-5 font-mono text-3xl tabular-nums text-paper">
        {view.price}
        {view.available ? <span className="ml-2 font-display text-xs uppercase tracking-widest text-steel">{q!.unit}</span> : null}
      </p>
      <p className="market-status mt-1 font-mono text-xs text-steel">{view.status}</p>
      {view.available ? <>
        <p className={cn("market-change mt-1 font-mono text-xs tabular-nums", tone)}>{view.change} · {t.markets.change}</p>
        <p className="mt-3 font-mono text-xs text-steel">
          {MARKET_COPY[q!.instrumentKind === "futures" ? "futures" : "spot"][lang]} · {q!.instrumentName} · {q!.instrumentId} · {q!.exchange}
        </p>
        <p className="mt-1 font-mono text-xs text-steel">{MARKET_COPY.source[lang]}: <a className="underline" href={q!.source!.url} target="_blank" rel="noreferrer">{q!.source!.name}</a></p>
      </> : <p className="mt-3 font-serif text-sm text-steel">{MARKET_COPY.sourceUnavailable[lang]}</p>}
      <LevelChart q={q} c={c} />
      <p className="mt-5 border-t border-paper/10 pt-4 font-serif text-sm leading-relaxed text-ice/90">{P.commodities[c.symbol]?.[lang]}</p>
    </article>
  );
}

/** Exactly two verified session closes, not a fabricated intraday/history curve. No visible dates. */
function LevelChart({ q, c }: { q?: Quote; c: Commodity }) {
  const { lang } = useLanguage();
  if (q?.status !== "verified" || q.price === null || q.previousPrice === null) {
    return <p className="market-chart-unavailable mt-5 rounded-md border border-paper/10 p-4 font-mono text-xs text-steel">{MARKET_COPY.comparisonUnavailable[lang]}</p>;
  }
  const up = q.price > q.previousPrice;
  const equal = q.price === q.previousPrice;
  const y0 = equal ? 50 : up ? 75 : 25;
  const y1 = equal ? 50 : up ? 25 : 75;
  return <div className={cn("mt-5", equal ? "text-steel" : up ? "text-up" : "text-down")}>
    <svg viewBox="0 0 300 100" className="h-28 w-full" role="img" aria-label={`${MARKET_COPY.previous[lang]} / ${MARKET_COPY.selected[lang]}`}>
      <line x1="8" y1={y0} x2="292" y2={y1} stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy={y0} r="3" fill="currentColor" /><circle cx="292" cy={y1} r="3" fill="currentColor" />
    </svg>
    <div className="mt-2 flex justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-steel">
      <span>{MARKET_COPY.previous[lang]} · {formatPrice(q.previousPrice, c.decimals)}</span>
      <span>{MARKET_COPY.selected[lang]} · {formatPrice(q.price, c.decimals)}</span>
    </div>
  </div>;
}
