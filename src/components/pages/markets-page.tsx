import { ArrowDownRight, ArrowUpRight, MapPin, Minus } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { SplitText } from "@/components/motion/split-text";
import { PageHero } from "@/components/pages/page-hero";
import { useQuotes } from "@/components/site/quotes-provider";
import { Reveal } from "@/components/site/reveal";
import { useLanguage } from "@/lib/language";
import { COMMODITIES, formatChange, formatPrice, type Commodity, type Quote } from "@/lib/markets";
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
          <span className="live-dot mt-1 size-2 shrink-0 rounded-full bg-up" aria-hidden />
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
            <span className="live-dot size-2 rounded-full bg-up" aria-hidden /> {P.live[lang]}
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

        {desk === "energy" && brent?.live && wti?.live ? (
          <div
            style={{ animationDelay: "600ms" }}
            className="board-in mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-navy px-6 py-5 shadow-[0_0_0_1px_rgb(224_138_46_/_0.22)]"
          >
            <span className="font-display text-sm uppercase tracking-widest text-wheat">
              {t.markets.spread}
            </span>
            <span className="font-mono text-2xl tabular-nums text-paper">
              {formatPrice(brent.price - wti.price, 2)}{" "}
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
  const live = !!q?.live;
  const up = (q?.change ?? 0) >= 0;
  const Arrow = !live ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <article
      data-tilt="7"
      style={{ animationDelay: `${delay}ms` }}
      className="board-in glow-card group flex flex-col rounded-xl bg-navy p-6 shadow-[0_0_0_1px_rgb(224_138_46_/_0.22)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgb(242_193_75_/_0.5)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-3xl font-semibold uppercase tracking-tight text-wheat">
            {c.symbol}
          </p>
          <p className="mt-1 font-serif text-sm text-ice">{lang === "fr" ? c.nameFr : c.nameEn}</p>
        </div>
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-full transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110",
            !live ? "bg-paper/10 text-steel" : up ? "bg-up/15 text-up" : "bg-down/15 text-down",
          )}
        >
          <Arrow className="size-5" />
        </span>
      </div>
      <p className="mt-5 font-mono text-3xl tabular-nums text-paper">
        {q ? formatPrice(q.price, c.decimals) : "··"}
        <span className="ml-2 font-display text-xs uppercase tracking-widest text-steel">
          {c.unit}
        </span>
      </p>
      <p
        className={cn(
          "mt-1 font-mono text-xs tabular-nums",
          !live ? "text-steel" : up ? "text-up" : "text-down",
        )}
      >
        {live ? `${formatChange(q!.change)} · ${t.markets.change}` : P.referenceLevel[lang]}
      </p>
      <LevelChart q={q} c={c} />
      <p className="mt-5 border-t border-paper/10 pt-4 font-serif text-sm leading-relaxed text-ice/90">
        {P.commodities[c.symbol]?.[lang]}
      </p>
    </article>
  );
}

/**
 * Honest chart: for live quotes it draws the move from the price 24 h ago to the last quote,
 * for reference levels a flat dashed level. No invented history.
 */
function LevelChart({ q, c }: { q?: Quote; c: Commodity }) {
  const { lang } = useLanguage();
  const live = !!q?.live;
  const up = (q?.change ?? 0) >= 0;
  const first = q?.history[0] ?? c.price;
  const last = q?.price ?? c.price;
  const y0 = live ? (up ? 78 : 22) : 50;
  const y1 = live ? (up ? 22 : 78) : 50;
  const tone = !live ? "text-steel" : up ? "text-up" : "text-down";
  const line = `M0,${y0} C120,${y0} 180,${y1} 300,${y1}`;
  const gid = `g-${c.symbol}`;
  return (
    <div className={cn("relative mt-5", tone)}>
      <div className="relative h-28">
        <svg
          viewBox="0 0 300 100"
          preserveAspectRatio="none"
          className="size-full overflow-visible"
        >
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[20, 40, 60, 80].map((y) => (
            <line
              key={y}
              x1="0"
              x2="300"
              y1={y}
              y2={y}
              className="stroke-paper/[0.07]"
              strokeDasharray="2 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {live ? (
            <path d={`${line} L300,100 L0,100 Z`} fill={`url(#${gid})`} className="chart-area" />
          ) : null}
          <path
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeDasharray={live ? undefined : "6 6"}
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            className={live ? "chart-draw" : "chart-flat"}
          />
          {!live ? (
            <rect
              x="0"
              y="30"
              width="60"
              height="40"
              className="chart-scan"
              fill={`url(#${gid})`}
            />
          ) : null}
        </svg>
        <span
          className="chart-dot absolute right-0 size-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-current"
          style={{ top: `${y1}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-widest text-steel">
        {live ? (
          <>
            <span>
              {P.prev[lang]} · {formatPrice(first, c.decimals)}
            </span>
            <span>
              {P.now[lang]} · {formatPrice(last, c.decimals)}
            </span>
          </>
        ) : (
          <span>
            {P.referenceLevel[lang]} · {formatPrice(last, c.decimals)}
          </span>
        )}
      </div>
    </div>
  );
}
