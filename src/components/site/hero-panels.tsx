import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Parallax } from "@/components/motion/parallax";
import { SplitText } from "@/components/motion/split-text";
import { heroPanels } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { useLanguage } from "@/lib/language";
import { ensureGsap, prefersReducedMotion, richMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const HeroGlobe = lazy(() => import("@/components/motion/hero-globe"));

export function HeroPanels() {
  const { t, lang } = useLanguage();
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(1);
  const [globe, setGlobe] = useState(false);
  const [globeActive, setGlobeActive] = useState(true);
  const hero = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const panels = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef({ p: 0 });

  // Load the 3D globe only on capable desktops, after first paint.
  useEffect(() => {
    if (!richMotion() || window.innerWidth < 768) return;
    const id = window.setTimeout(() => setGlobe(true), 250);
    return () => window.clearTimeout(id);
  }, []);

  // Pause the WebGL loop when the hero is off screen.
  useEffect(() => {
    const el = hero.current;
    if (!el || !globe) return;
    const io = new IntersectionObserver(([e]) => setGlobeActive(!!e?.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [globe]);

  // Intro timeline, mouse depth parallax and scroll out.
  useEffect(() => {
    const root = hero.current;
    if (!root || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-logo]",
        { scale: 0.4, rotate: -160, autoAlpha: 0, filter: "blur(10px)" },
        { scale: 1, rotate: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1.4, ease: "expo.out", delay: 0.1 },
      );
      gsap.fromTo(
        "[data-hero-fade]",
        { y: 28, autoAlpha: 0, filter: "blur(6px)" },
        { y: 0, autoAlpha: 1, filter: "blur(0px)", duration: 1.1, ease: "expo.out", stagger: 0.12, delay: 0.9 },
      );
      gsap.fromTo(
        "[data-hero-glow]",
        { scale: 0.6, autoAlpha: 0 },
        { scale: 1, autoAlpha: 1, duration: 2.2, ease: "power2.out" },
      );
      gsap.to(content.current, {
        yPercent: 22,
        autoAlpha: 0.15,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(scroll.current, {
        p: 1,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
      if (panels.current) {
        gsap.fromTo(
          panels.current.children,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.3,
            ease: "expo.inOut",
            stagger: 0.12,
            scrollTrigger: { trigger: panels.current, start: "top 88%", once: true },
            clearProps: "clipPath",
          },
        );
      }
    }, root);

    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-depth]"));
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      pointer.current.x = x;
      pointer.current.y = y;
      for (const l of layers) {
        const d = Number(l.dataset.depth) || 0;
        gsap.to(l, { x: x * d, y: y * d, duration: 1.2, ease: "power3.out", overwrite: "auto" });
      }
    };
    const fine = richMotion();
    if (fine) root.addEventListener("pointermove", onMove);
    return () => {
      if (fine) root.removeEventListener("pointermove", onMove);
      ctx.revert();
    };
  }, []);

  return (
    <section className="bg-ink">
      <div ref={hero} className="relative flex min-h-[calc(100svh-7.5rem)] flex-col items-center justify-center overflow-hidden px-6 py-14 sm:py-20">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
        <div
          data-hero-glow
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(224_138_46_/_0.18),transparent_62%)]"
        />
        {globe ? (
          <div data-depth="-14" className="globe-fade pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[min(58rem,105vw)] -translate-x-1/2 -translate-y-1/2">
            <Suspense fallback={null}>
              <HeroGlobe pointer={pointer.current} scroll={scroll.current} active={globeActive} />
            </Suspense>
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(12_28_30_/_0.55)_0%,rgb(12_28_30_/_0.2)_38%,transparent_60%)]" />

        <div ref={content} className="relative flex flex-col items-center">
          <div data-depth="22" className="relative">
            <div data-hero-logo>
            <img src="/mark.svg" alt="" className="relative size-24 outline-none drop-pulse sm:size-32" />
            </div>
          </div>
          <div data-depth="10" className="flex flex-col items-center">
            <SplitText
              as="p"
              by="chars"
              immediate
              delay={350}
              stagger={32}
              text="Geneva University"
              className="relative mt-6 text-center font-display text-4xl font-semibold uppercase leading-none tracking-tight text-paper sm:text-6xl"
            />
            <SplitText
              as="p"
              by="chars"
              immediate
              delay={700}
              stagger={32}
              text="Commodities Club"
              className="text-shimmer relative mt-2 text-center font-display text-4xl font-semibold uppercase leading-none tracking-tight text-copper sm:text-6xl"
            />
          </div>
          <div data-depth="5" className="flex flex-col items-center">
            <p data-hero-fade className="relative mt-6 text-center font-display text-sm uppercase tracking-widest text-wheat sm:text-base">
              {t.hero.tagline}
            </p>
            <SplitText
              as="h1"
              immediate
              delay={1100}
              text={t.hero.title}
              className="relative mt-4 max-w-3xl text-center font-display text-2xl font-semibold uppercase leading-none tracking-tight text-paper sm:text-4xl"
            />
            <p data-hero-fade className="relative mt-5 max-w-xl text-center font-serif text-sm leading-relaxed text-ice sm:text-base">
              {t.hero.lead}
            </p>
            <p data-hero-fade className="relative mt-8 max-w-xl text-center font-serif text-sm leading-relaxed text-wheat sm:text-base">
              {t.hero.place}
            </p>
          </div>
        </div>
        <div aria-hidden className="scroll-cue absolute bottom-6 left-1/2 hidden h-12 w-7 -translate-x-1/2 rounded-full shadow-[0_0_0_1px_rgb(242_193_75_/_0.5)] sm:block">
          <span className="absolute left-1/2 top-2 h-2.5 w-1 -translate-x-1/2 rounded-full bg-wheat" />
        </div>
      </div>

      <div ref={panels} className="flex min-h-96 flex-col md:h-[28rem] lg:h-[34rem] md:flex-row">
        {heroPanels.map((panel, i) => {
          const on = active === i;
          return (
            <button
              key={panel.id}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={cn(
                "relative min-h-64 overflow-hidden text-left md:min-h-0",
                reduced
                  ? "md:flex-1"
                  : "transition-[flex-grow] duration-[var(--motion-emphasis)] ease-[var(--ease-smooth-out)]",
                on ? "flex-[2.6]" : "flex-1",
              )}
              aria-pressed={on}
            >
              <Parallax className="absolute inset-0" innerClassName="relative" amount={16}>
                <img
                  src={panel.image}
                  alt={panel.title[lang]}
                  className={cn(
                    "absolute inset-0 size-full object-cover outline-none transition-[transform,filter] duration-[1200ms] ease-[var(--ease-out)]",
                    on && !reduced ? "scale-110 saturate-[1.15]" : "scale-100 saturate-[0.8]",
                  )}
                />
              </Parallax>
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent transition-opacity duration-[var(--motion-fast)]",
                  on ? "opacity-100" : "opacity-70",
                )}
              />
              <div className="relative flex h-full min-h-64 flex-col justify-end p-5 sm:p-8 md:min-h-full">
                <p className="font-display text-xs uppercase tracking-widest text-wheat">{panel.kicker[lang]}</p>
                <h2
                  className={cn(
                    "mt-1 font-display text-3xl font-semibold uppercase tracking-wide text-paper transition-[letter-spacing] duration-[var(--motion-emphasis)] sm:text-5xl",
                    on && !reduced && "md:tracking-[0.08em]",
                  )}
                >
                  {panel.title[lang]}
                </h2>
                <p
                  className={cn(
                    "mt-3 max-w-md font-serif text-sm leading-relaxed text-ice sm:text-base",
                    "md:transition-[opacity,transform,filter] md:duration-[var(--motion-medium)] md:ease-[var(--ease-smooth-out)]",
                    on
                      ? "translate-y-0 opacity-100 blur-0"
                      : "md:pointer-events-none md:translate-y-2 md:opacity-0 md:blur-[4px]",
                  )}
                >
                  {panel.body[lang]}
                </p>
              </div>
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 bottom-0 h-[3px] origin-left bg-gradient-to-r from-copper to-wheat transition-transform duration-[var(--motion-emphasis)] ease-[var(--ease-out)]",
                  on ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
