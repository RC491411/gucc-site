import { Link } from "@tanstack/react-router";
import { Activity, ArrowUpRight, BookOpen, Mic2, Waypoints } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SplitText } from "@/components/motion/split-text";
import { PageHero } from "@/components/pages/page-hero";
import { CtaOrb } from "@/components/site/cta-orb";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";
import { missionsPage as P } from "@/lib/pages";
import { cn } from "@/lib/utils";

export const MISSION_ICONS = {
  formation: BookOpen,
  analyse: Activity,
  conferences: Mic2,
  networking: Waypoints,
} as const;

type Key = keyof typeof MISSION_ICONS;

export function MissionsPage() {
  const { t, lang } = useLanguage();
  useEffect(() => {
    document.title = P.meta[lang];
  }, [lang]);

  return (
    <div className="bg-ink text-paper">
      <PageHero
        index="02 / 06"
        kicker={P.kicker[lang]}
        title={P.title[lang]}
        lead={P.lead[lang]}
        visual={<MissionStack />}
      >
        <a
          href="#mission-story"
          className="mt-8 inline-flex h-11 items-center gap-3 font-display text-sm uppercase tracking-widest text-wheat"
        >
          <span className="live-dot size-2 rounded-full bg-copper" aria-hidden />
          {P.scroll[lang]}
        </a>
      </PageHero>

      <MissionStory />

      <section className="relative overflow-hidden border-t border-copper/20 bg-navy">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 py-24 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-32">
          <div>
            <SplitText text={P.outroTitle[lang]} className="max-w-xl font-display text-4xl font-semibold uppercase leading-none tracking-tight sm:text-6xl" />
            <Reveal delay={150}>
              <p className="mt-6 max-w-lg font-serif text-lg leading-relaxed text-ice">{P.outroBody[lang]}</p>
              <Button asChild size="lg" variant="secondary" className="mt-8">
                <Link to="/news">
                  {P.outroNews[lang]}
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </Reveal>
          </div>
          <Reveal delay={120} className="flex justify-center pb-12">
            <CtaOrb to="/contact" search={{ interest: "join" }} label={P.outroJoin[lang]} ring={t.join.ring} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/** Hero visual: the four missions as floating isometric layers that follow the pointer. */
function MissionStack() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !isFinePointer() || prefersReducedMotion()) return;
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      el.style.setProperty("--mx", `${x * 14}deg`);
      el.style.setProperty("--my", `${-y * 10}deg`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const items = t.missions.items;
  return (
    <div ref={ref} aria-hidden className="mission-stack relative aspect-square w-[min(30rem,80vw)]">
      <div className="mission-stack-plane absolute inset-[12%]">
        {items.map((item, i) => {
          const Icon = MISSION_ICONS[item.key as Key];
          const top = i === items.length - 1;
          return (
            <div
              key={item.key}
              className={cn(
                "mission-layer absolute inset-0 flex flex-col justify-between rounded-2xl p-6",
                top ? "bg-copper text-ink" : "bg-navy text-paper shadow-[0_0_0_1px_rgb(224_138_46_/_0.45)]",
              )}
              style={{ "--i": i } as CSSProperties}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{String(i + 1).padStart(2, "0")}</span>
                <Icon className="size-7" />
              </div>
              <span className="font-display text-3xl font-semibold uppercase tracking-tight">{item.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Sticky 3D card deck on the left, long-form chapters on the right. */
function MissionStory() {
  const { t, lang } = useLanguage();
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const items = t.missions.items;

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="mission-story" className="scroll-mt-20 border-t border-copper/20 bg-ink">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="hidden lg:block">
          <div className="sticky top-24 flex h-[calc(100svh-7rem)] flex-col justify-center">
            <div className="mission-deck relative mx-auto aspect-[4/5] w-full max-w-sm">
              {items.map((item, i) => {
                const Icon = MISSION_ICONS[item.key as Key];
                const off = i - active;
                return (
                  <div
                    key={item.key}
                    className="mission-deck-card absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl bg-navy p-8 shadow-[0_0_0_1px_rgb(224_138_46_/_0.4),0_40px_80px_rgb(0_0_0_/_0.45)]"
                    data-state={off < 0 ? "past" : off === 0 ? "active" : "next"}
                    style={{ "--off": Math.max(0, off), zIndex: 10 - Math.abs(off) } as CSSProperties}
                  >
                    <div className="bg-grid absolute inset-0 opacity-40" />
                    <div className="relative flex items-start justify-between">
                      <span className="font-display text-8xl font-semibold leading-none text-copper/90">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex size-14 items-center justify-center rounded-xl bg-copper text-ink">
                        <Icon className="size-7" />
                      </span>
                    </div>
                    <div className="relative">
                      <p className="font-display text-4xl font-semibold uppercase tracking-tight">{item.title}</p>
                      <p className="mt-3 font-serif text-sm leading-relaxed text-ice/90">{item.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mx-auto mt-8 flex w-full max-w-sm gap-2">
              {items.map((item, i) => (
                <span key={item.key} className="h-1 flex-1 overflow-hidden rounded-full bg-paper/10">
                  <span
                    className="block h-full origin-left bg-wheat transition-transform duration-700 ease-[var(--ease-smooth-out)]"
                    style={{ transform: `scaleX(${i <= active ? 1 : 0})` }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          {items.map((item, i) => {
            const Icon = MISSION_ICONS[item.key as Key];
            const extra = P.items[item.key as Key];
            return (
              <article
                key={item.key}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                data-index={i}
                className={cn(
                  "flex flex-col justify-center py-16 lg:min-h-[100svh] lg:py-24",
                  i > 0 && "border-t border-copper/15 lg:border-0",
                )}
              >
                <Reveal>
                  <div className="flex items-center gap-4">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-copper text-ink lg:hidden">
                      <Icon className="size-6" />
                    </span>
                    <span className="font-mono text-sm text-wheat">{String(i + 1).padStart(2, "0")} / 04</span>
                    <span className="h-px flex-1 bg-gradient-to-r from-copper/60 to-transparent" />
                  </div>
                </Reveal>
                <SplitText
                  text={item.title}
                  by="chars"
                  className="mt-6 font-display text-5xl font-semibold uppercase leading-none tracking-tight sm:text-7xl"
                />
                <Reveal delay={120}>
                  <p className="mt-6 font-serif text-xl leading-relaxed text-paper">{item.body}</p>
                  <p className="mt-4 font-serif text-lg leading-relaxed text-ice/85">{extra.intro[lang]}</p>
                </Reveal>
                <Reveal delay={220}>
                  <p className="mt-10 font-display text-xs uppercase tracking-widest text-copper">{P.focus[lang]}</p>
                </Reveal>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {extra.topics[lang].map((topic, j) => (
                    <li key={topic}>
                      <Reveal delay={260 + j * 90} className="h-full">
                        <div
                          data-tilt="10"
                          className="glow-card flex h-full gap-3 rounded-xl bg-navy p-5 shadow-[0_0_0_1px_rgb(224_138_46_/_0.22)]"
                        >
                          <span className="font-mono text-xs text-wheat">{String.fromCharCode(97 + j)}.</span>
                          <span className="font-serif text-base leading-snug text-ice">{topic}</span>
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
