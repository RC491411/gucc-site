import { Link } from "@tanstack/react-router";
import { Activity, ArrowDownRight, ArrowUpRight, BookOpen, Mic2, Waypoints } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Marquee } from "@/components/motion/marquee";
import { Parallax } from "@/components/motion/parallax";
import { SplitText } from "@/components/motion/split-text";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { HeroPanels } from "@/components/site/hero-panels";
import { NewsSection } from "@/components/site/news-section";
import { ContactCta } from "@/components/site/contact-cta";
import { TeamSequence } from "@/components/team/team-sequence";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { Sparkline } from "@/components/site/sparkline";
import { useLanguage } from "@/lib/language";
import { COMMODITIES, formatChange, formatPrice } from "@/lib/markets";
import { useQuotes } from "@/components/site/quotes-provider";
import { cn } from "@/lib/utils";

const ICONS = {
  formation: BookOpen,
  analyse: Activity,
  conferences: Mic2,
  networking: Waypoints,
} as const;

export function HomePage() {
  const { t, lang } = useLanguage();
  const quotes = useQuotes();
  const [desk, setDesk] = useState<"energy" | "metals" | "ag">("energy");


  const board = useMemo(() => COMMODITIES.filter((c) => c.desk === desk), [desk]);

  return (
    <div>
      <HeroPanels />

      <section id="club" className="scroll-mt-24 bg-paper text-ink">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:py-28">
          <Reveal>
            <p className="font-display text-xs uppercase tracking-widest text-copper">{t.club.kicker}</p>
            <SplitText text={t.club.title} className="mt-3 font-display text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl" />
            <p className="mt-6 max-w-xl font-serif text-lg leading-relaxed text-ink/80">{t.club.body}</p>
          </Reveal>
          <Reveal delay={80}>
            <aside data-tilt="10" className="glow-card rounded-xl bg-navy p-6 text-paper shadow-[0_0_0_1px_rgb(224_138_46_/_0.35)] sm:p-8">
              <img src="/mark.svg" alt="" className="drop-pulse size-12" />
              <p className="mt-5 font-serif text-base leading-relaxed text-ice">{t.club.aside}</p>
            </aside>
          </Reveal>
        </div>
      </section>

      <section id="missions" className="scroll-mt-24 bg-ink">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <Reveal>
            <p className="font-display text-xs uppercase tracking-widest text-copper">{t.missions.kicker}</p>
            <SplitText text={t.missions.title} className="mt-3 max-w-2xl font-display text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl" />
          </Reveal>
          <MissionsGrid>
            {t.missions.items.map((item) => {
              const Icon = ICONS[item.key as keyof typeof ICONS];
              return (
                <div key={item.key} data-mission className="h-full">
                  <article data-tilt="9" className="glow-card group/m h-full rounded-xl bg-navy p-6 shadow-[0_0_0_1px_rgb(224_138_46_/_0.22)] transition-[box-shadow] duration-[var(--motion-quick)] hover:shadow-[0_0_0_1px_rgb(242_193_75_/_0.45)] sm:p-8">
                    <div className="flex size-11 items-center justify-center rounded-md text-wheat shadow-[0_0_0_1px_rgb(224_138_46_/_0.4)] transition-[transform,background-color,color] duration-[var(--motion-emphasis)] ease-[var(--ease-smooth-out)] group-hover/m:rotate-[8deg] group-hover/m:scale-110 group-hover/m:bg-copper group-hover/m:text-ink">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-semibold uppercase tracking-wide">{item.title}</h3>
                    <p className="mt-3 font-serif text-base leading-relaxed text-ice/90">{item.body}</p>
                  </article>
                </div>
              );
            })}
          </MissionsGrid>
        </div>
      </section>

      <Marquee text="Geneva University Commodities Club" />

      <section id="fondateurs" className="scroll-mt-24 bg-paper text-ink">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-20 sm:px-6 lg:pt-28">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <Reveal>
              <p className="font-display text-xs uppercase tracking-widest text-copper">{t.founders.kicker}</p>
              <SplitText text={t.founders.title} className="mt-3 max-w-2xl font-display text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl" />
            </Reveal>
            <Reveal delay={120}>
              <p className="max-w-lg font-serif text-lg leading-relaxed text-ink/80">{t.founders.lead}</p>
            </Reveal>
          </div>

          <Reveal delay={40}>
            <figure className="mt-10">
              <Parallax reveal amount={14} className="aspect-video rounded-xl">
                <img
                  src="/founders-group.jpg"
                  alt={t.founders.photoCaption}
                  className="size-full object-cover object-top"
                />
              </Parallax>
              <figcaption className="mt-3 px-1 font-display text-xs uppercase tracking-widest text-ink/50">
                {t.founders.photoCaption}
              </figcaption>
            </figure>
          </Reveal>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-6 sm:px-6 lg:max-w-none lg:px-0 lg:pb-0">
          <TeamSequence />
        </div>
        <div className="mx-auto flex max-w-6xl justify-center px-4 py-14 sm:px-6">
          <Button asChild size="lg">
            <Link to="/founders">
              {t.founders.meet}
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section id="marches" className="scroll-mt-24 border-t border-copper/20 bg-ink">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <Reveal>
            <p className="font-display text-xs uppercase tracking-widest text-copper">{t.markets.kicker}</p>
            <SplitText text={t.markets.title} className="mt-3 max-w-2xl font-display text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl" />
            <p className="mt-5 max-w-2xl font-serif text-lg leading-relaxed text-ice/90">{t.markets.lead}</p>
          </Reveal>

          <div className="mt-8 flex flex-wrap gap-2">
            {t.markets.desks.map((d) => (
              <button
                key={d.key}
                type="button"
                data-magnetic="0.3"
                onClick={() => setDesk(d.key as typeof desk)}
                className={cn(
                  "h-11 rounded-md px-4 font-display text-sm uppercase tracking-widest transition-[background-color,color] duration-[var(--motion-quick)]",
                  desk === d.key ? "bg-copper text-ink" : "text-ice shadow-[0_0_0_1px_rgb(224_138_46_/_0.35)] hover:text-wheat",
                )}
              >
                {d.title}
              </button>
            ))}
          </div>
          <p className="mt-4 max-w-xl font-serif text-sm leading-relaxed text-steel">
            {t.markets.desks.find((d) => d.key === desk)?.body}
          </p>

          <div key={desk} className="mt-8 grid gap-3 sm:grid-cols-3">
            {board.map((c, i) => {
              const q = quotes[c.symbol];
              const up = (q?.change ?? 0) >= 0;
              return (
                <article
                  key={c.symbol}
                  data-tilt="8"
                  style={{ animationDelay: `${i * 90}ms` }}
                  className="board-in glow-card rounded-xl bg-navy p-5 shadow-[0_0_0_1px_rgb(224_138_46_/_0.22)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-sm uppercase tracking-widest text-wheat">{c.symbol}</p>
                      <p className="mt-1 font-serif text-sm text-ice">{lang === "fr" ? c.nameFr : c.nameEn}</p>
                    </div>
                    {up ? (
                      <ArrowUpRight className="size-4 text-up" aria-hidden />
                    ) : (
                      <ArrowDownRight className="size-4 text-down" aria-hidden />
                    )}
                  </div>
                  <p className="mt-4 font-mono text-2xl tabular-nums text-paper">
                    {q ? formatPrice(q.price, c.decimals) : "··"}
                    <span className="ml-2 font-display text-xs uppercase tracking-widest text-steel">{c.unit}</span>
                  </p>
                  <p className={cn("mt-1 font-mono text-xs tabular-nums", up ? "text-up" : "text-down")}>
                    {q?.live ? formatChange(q.change) : "—"} · {q?.live ? t.markets.change : t.markets.reference}
                  </p>
                  {q ? (
                    <div className={cn("mt-3", up ? "text-up" : "text-down")}>
                      <Sparkline data={q.history} />
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <NewsSection />

      <section id="rejoindre" className="scroll-mt-24 bg-ink">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-28 lg:pb-32">
          <Reveal>
            <p className="font-display text-xs uppercase tracking-widest text-copper">{t.join.kicker}</p>
            <SplitText text={t.join.title} className="mt-3 font-display text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl" />
            <p className="mt-5 font-serif text-lg leading-relaxed text-ice/90">{t.join.lead}</p>
            <p className="mt-4 font-serif text-base leading-relaxed text-steel">{t.join.how}</p>
            <a
              href="mailto:gucc@unige.ch"
              className="mt-6 inline-block font-display text-sm uppercase tracking-widest text-wheat underline-offset-4 hover:underline"
            >
              gucc@unige.ch
            </a>
          </Reveal>
          <Reveal delay={80} className="flex items-center justify-center">
            <ContactCta />
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/** Keeps the 2x2 missions grid, assembling the cards in 3D as the section scrolls in. */
function MissionsGrid({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-mission]");
      cards.forEach((card, i) => {
        const fromLeft = i % 2 === 0;
        gsap.fromTo(
          card,
          {
            rotateX: 38,
            rotateY: fromLeft ? -18 : 18,
            z: -260,
            y: 140,
            xPercent: fromLeft ? -12 : 12,
            autoAlpha: 0,
          },
          {
            rotateX: 0,
            rotateY: 0,
            z: 0,
            y: 0,
            xPercent: 0,
            autoAlpha: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 98%",
              end: "top 55%",
              scrub: 0.8,
            },
          },
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className="missions-stage mt-12 grid gap-4 sm:grid-cols-2">
      {children}
    </div>
  );
}
