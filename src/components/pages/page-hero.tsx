import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { SplitText } from "@/components/motion/split-text";
import { Reveal } from "@/components/site/reveal";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";

type Props = {
  index: string;
  kicker: string;
  title: string;
  lead: string;
  visual: ReactNode;
  children?: ReactNode;
};

/** Shared hero for the dedicated pages: breadcrumb, char split title, lead and a topic visual. */
export function PageHero({ index, kicker, title, lead, visual, children }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.to("[data-hero-copy]", {
        yPercent: -18,
        autoAlpha: 0.15,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-visual]", {
        yPercent: 12,
        scale: 0.94,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="page-hero relative overflow-hidden bg-ink">
      <div className="bg-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_75%)]" />
      <div aria-hidden className="hero-glow absolute -right-40 top-10 size-[38rem] rounded-full" />
      <div className="relative mx-auto grid min-h-[calc(100svh-8rem)] max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pb-20">
        <div data-hero-copy>
          <Reveal>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-display text-xs uppercase tracking-widest text-steel">
              <Link to="/" className="hover:text-wheat">GUCC</Link>
              <ChevronRight className="size-3 text-copper" />
              <span className="text-ice">{kicker}</span>
            </nav>
          </Reveal>
          <p className="mt-10 flex items-center gap-3 font-display text-xs uppercase tracking-widest text-copper">
            <span className="font-mono text-wheat">{index}</span>
            <span className="hero-rule h-px w-12 bg-copper" />
            {kicker}
          </p>
          <SplitText
            as="h1"
            by="chars"
            immediate
            delay={200}
            stagger={22}
            text={title}
            className="mt-4 max-w-2xl font-display text-5xl font-semibold uppercase leading-[0.92] tracking-tight sm:text-7xl"
          />
          <Reveal delay={550}>
            <p className="mt-7 max-w-xl font-serif text-lg leading-relaxed text-ice sm:text-xl">{lead}</p>
          </Reveal>
          {children ? <Reveal delay={700}>{children}</Reveal> : null}
        </div>
        <div data-hero-visual className="relative mt-16 flex items-center justify-center sm:mt-10 lg:mt-0">
          {visual}
        </div>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center lg:flex">
        <span className="scroll-line block h-12 w-px overflow-hidden bg-paper/15">
          <span className="block h-1/2 w-full bg-wheat" />
        </span>
      </div>
    </section>
  );
}
