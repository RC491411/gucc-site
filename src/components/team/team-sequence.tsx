import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Linkedin } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { SplitText } from "@/components/motion/split-text";
import { Reveal } from "@/components/site/reveal";
import { founders } from "@/lib/content";
import { useLanguage } from "@/lib/language";
import { ensureGsap, getLenis } from "@/lib/motion";
import { cn } from "@/lib/utils";

const N = founders.length;

/**
 * Desktop: a pinned stage where the four founders are introduced one by one
 * while scrolling, with a 3D card deck, split name reveal and key facts.
 * Mobile and reduced motion: a simple list of animated cards.
 */
export function TeamSequence() {
  return (
    <>
      <PinnedDeck />
      <TeamList />
    </>
  );
}

function PinnedDeck() {
  const { t, lang } = useLanguage();
  const stage = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const bgWord = useRef<HTMLDivElement>(null);
  const trigger = useRef<{ start: number; end: number } | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const { gsap, ScrollTrigger } = ensureGsap();
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top+=80",
        end: `+=${N * 85}%`,
        pin: true,
        pinSpacing: true,
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const idx = Math.min(N - 1, Math.floor(p * N * 0.999));
          setActive((prev) => (prev === idx ? prev : idx));
          if (bar.current) bar.current.style.setProperty("--p", String(p));
          if (bgWord.current) bgWord.current.style.transform = `translate3d(${-p * 30}%, 0, 0)`;
        },
        onRefresh: (self) => {
          trigger.current = { start: self.start, end: self.end };
        },
      });
      trigger.current = { start: st.start, end: st.end };
      return () => st.kill();
    });
    return () => mm.revert();
  }, []);

  const goTo = (i: number) => {
    const tr = trigger.current;
    if (!tr) return;
    const y = tr.start + ((tr.end - tr.start) * (i + 0.5)) / N;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const f = founders[active];

  return (
    <div className="team-pinned hidden lg:block">
      <div
        ref={stage}
        className="relative h-[calc(100svh-5rem)] overflow-hidden bg-ink text-paper"
      >
        <div className="bg-grid absolute inset-0 opacity-70" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgb(224_138_46_/_0.2),transparent_60%)]" />
        <div
          ref={bgWord}
          aria-hidden
          className="pointer-events-none absolute bottom-[-0.12em] left-0 whitespace-nowrap font-display text-[22vw] font-bold uppercase leading-none text-transparent [-webkit-text-stroke:1px_rgb(224_138_46_/_0.18)]"
        >
          {founders.map((x) => x.name.split(" ")[0]).join(" · ")}
        </div>

        <div className="relative mx-auto grid h-full max-w-6xl grid-cols-[1fr_1.05fr] items-center gap-14 px-6">
          {/* Deck */}
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[24rem] [perspective:1600px]">
            {founders.map((x, i) => {
              const off = i - active;
              const style: CSSProperties =
                off === 0
                  ? { transform: "translate3d(0,0,0) rotateY(0deg) rotateZ(0deg)", opacity: 1, zIndex: 10 }
                  : off < 0
                    ? {
                        transform: "translate3d(-70%, 4%, -420px) rotateY(62deg) rotateZ(-6deg)",
                        opacity: 0,
                        zIndex: 10 + off,
                      }
                    : {
                        transform: `translate3d(${off * 16}%, ${-off * 5}%, ${-off * 160}px) rotateY(-20deg) rotateZ(${off * 3}deg)`,
                        opacity: 1 - off * 0.22,
                        zIndex: 10 - off,
                        filter: `brightness(${1 - off * 0.2}) saturate(${1 - off * 0.25})`,
                      };
              return (
                <div
                  key={x.id}
                  className="absolute inset-0 transition-[transform,opacity,filter] duration-[1100ms] ease-[var(--ease-smooth-out)] [transform-style:preserve-3d]"
                  style={style}
                  aria-hidden={off !== 0}
                >
                  <div
                    data-tilt={off === 0 ? "10" : undefined}
                    className="glow-card size-full overflow-hidden rounded-2xl bg-navy shadow-[0_40px_80px_-30px_rgb(0_0_0_/_0.7),0_0_0_1px_rgb(224_138_46_/_0.35)]"
                  >
                    <img src={x.image} alt={off === 0 ? x.name : ""} className="size-full object-cover object-top outline-none" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/70 to-transparent p-5 pt-16">
                      <p className="font-mono text-xs tracking-widest text-wheat">
                        {String(i + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
                      </p>
                      <p className="mt-1 font-display text-2xl font-semibold uppercase tracking-wide">{x.name}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Copy */}
          <div className="relative min-h-[26rem]">
            <p className="font-display text-xs uppercase tracking-widest text-copper">{t.founders.kicker}</p>
            <div key={`${f.id}-${lang}`} className="team-copy">
              <p className="mt-6 font-display text-[7rem] font-bold leading-[0.8] text-transparent [-webkit-text-stroke:1.5px_rgb(242_193_75_/_0.75)]">
                {String(active + 1).padStart(2, "0")}
              </p>
              <SplitText
                as="h3"
                by="chars"
                immediate
                stagger={30}
                text={f.name}
                className="mt-4 font-display text-6xl font-semibold uppercase leading-none tracking-tight"
              />
              <p className="team-line mt-3 font-display text-sm uppercase tracking-[0.3em] text-wheat" style={{ "--i": 1 } as CSSProperties}>
                {f.role[lang]}
              </p>
              <p className="team-line mt-5 max-w-lg font-serif text-base leading-relaxed text-ice/90" style={{ "--i": 2 } as CSSProperties}>
                {f.bio[lang]}
              </p>
              <ul className="mt-6 grid max-w-lg grid-cols-2 gap-2">
                {f.facts[lang].map((fact, k) => (
                  <li
                    key={fact}
                    className="team-line rounded-md bg-paper/5 px-3 py-2 font-display text-xs uppercase tracking-wider text-paper shadow-[0_0_0_1px_rgb(224_138_46_/_0.3)]"
                    style={{ "--i": 3 + k } as CSSProperties}
                  >
                    {fact}
                  </li>
                ))}
              </ul>
              <div className="team-line mt-7 flex flex-wrap items-center gap-4" style={{ "--i": 8 } as CSSProperties}>
                <a
                  href={f.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  data-magnetic="0.3"
                  className="inline-flex h-11 items-center gap-2 rounded-md px-4 font-display text-sm uppercase tracking-widest text-wheat shadow-[0_0_0_1px_rgb(224_138_46_/_0.55)] transition-colors hover:bg-copper/15"
                >
                  <Linkedin className="size-4" /> {t.founders.linkedin}
                </a>
                <Link
                  to="/team"
                  hash={f.id}
                  className="inline-flex h-11 items-center gap-1 font-display text-sm uppercase tracking-widest text-ice hover:text-wheat"
                >
                  {t.team.background} <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div ref={bar} className="absolute inset-x-0 bottom-8 mx-auto flex max-w-6xl items-center gap-3 px-6" style={{ "--p": 0 } as CSSProperties}>
          {founders.map((x, i) => (
            <button
              key={x.id}
              type="button"
              onClick={() => goTo(i)}
              className="group/seg flex flex-1 flex-col gap-2 text-left"
              aria-label={x.name}
            >
              <span className="relative block h-[3px] overflow-hidden rounded-full bg-paper/15">
                <span
                  className="absolute inset-0 origin-left bg-gradient-to-r from-copper to-wheat"
                  style={{ transform: `scaleX(clamp(0, calc(var(--p) * ${N} - ${i}), 1))` }}
                />
              </span>
              <span
                className={cn(
                  "font-display text-xs uppercase tracking-widest transition-colors",
                  i === active ? "text-wheat" : "text-steel group-hover/seg:text-paper",
                )}
              >
                {x.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamList() {
  const { t, lang } = useLanguage();
  return (
    <div className="team-list -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:hidden">
      {founders.map((f, i) => (
        <Reveal key={f.id} delay={i * 100} className="w-[82vw] max-w-sm shrink-0 snap-center sm:w-auto sm:max-w-none">
          <article data-tilt="10" className="glow-card group h-full overflow-hidden rounded-xl bg-navy text-paper shadow-[0_0_0_1px_rgb(224_138_46_/_0.28)]">
            <div className="relative aspect-[4/4] overflow-hidden">
              <img
                src={f.image}
                alt={f.name}
                className="size-full object-cover object-top transition-transform duration-[var(--motion-slow)] ease-[var(--ease-out)] group-hover:scale-[1.06]"
              />
              <p className="absolute left-4 top-4 rounded-sm bg-ink/70 px-2 py-1 font-mono text-xs text-wheat">
                {String(i + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
              </p>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-2xl font-semibold uppercase tracking-wide">{f.name}</h3>
                  <p className="mt-1 font-display text-xs uppercase tracking-widest text-wheat">{f.role[lang]}</p>
                </div>
                <a
                  href={f.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${t.founders.linkedin} ${f.name}`}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-ice transition-colors duration-[var(--motion-quick)] hover:bg-copper/20 hover:text-wheat"
                >
                  <Linkedin className="size-4" />
                </a>
              </div>
              <p className="font-serif text-sm leading-relaxed text-ice/90">{f.bio[lang]}</p>
              <ul className="flex flex-wrap gap-1.5 pt-1">
                {f.facts[lang].map((fact) => (
                  <li key={fact} className="rounded-sm bg-paper/5 px-2 py-1 font-display text-[0.7rem] uppercase tracking-wider text-paper/90 shadow-[0_0_0_1px_rgb(224_138_46_/_0.25)]">
                    {fact}
                  </li>
                ))}
              </ul>
              <Link
                to="/team"
                hash={f.id}
                className="inline-flex h-11 items-center gap-1 font-display text-sm uppercase tracking-widest text-wheat hover:underline"
              >
                {t.team.background} <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
