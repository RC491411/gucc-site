import { Link } from "@tanstack/react-router";
import { Fragment, useEffect, useRef } from "react";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";

const NAME = "Geneva University Commodities Club";
const COLLAPSE_AT = 72;
const EXPAND_AT = 36;

function Chars({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((word, w, words) => (
        <Fragment key={w}>
          <span className="inline-block whitespace-nowrap">
            {[...word].map((ch, i) => (
              <span key={i} data-ch className="inline-block will-change-transform">
                {ch}
              </span>
            ))}
          </span>
          {w < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}

/**
 * Centred header logo. At the top of the page the mark sits next to the full club name;
 * once the page scrolls, the letters blur out with a stagger, the name collapses and only
 * the mark stays centred. Scrolling back to the top plays it in reverse.
 */
export function HeaderBrand() {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { gsap } = ensureGsap();
    const mm = gsap.matchMedia();
    let collapsed = false;
    let tl: gsap.core.Timeline | null = null;

    const apply = (next: boolean, instant = false) => {
      collapsed = next;
      el.dataset.collapsed = String(next);
      if (!tl) return;
      if (instant || prefersReducedMotion()) {
        tl.pause().progress(next ? 1 : 0);
      } else if (next) {
        tl.timeScale(1).play();
      } else {
        tl.timeScale(1.15).reverse();
      }
    };

    mm.add({ wide: "(min-width: 640px)", narrow: "(max-width: 639.98px)" }, (ctx) => {
      const wide = Boolean(ctx.conditions?.wide);
      const text = el.querySelector<HTMLElement>(wide ? "[data-brand-wide]" : "[data-brand-narrow]");
      const mark = el.querySelector<HTMLElement>("[data-brand-mark]");
      if (!text || !mark) return;
      const chars = text.querySelectorAll<HTMLElement>("[data-ch]");
      tl = gsap.timeline({ paused: true, defaults: { ease: "power3.inOut" } });
      tl.to(chars, {
        yPercent: -70,
        autoAlpha: 0,
        filter: "blur(6px)",
        duration: 0.32,
        ease: "power2.in",
        stagger: { each: 0.011, from: "end" },
      })
        .to(text, wide ? { width: 0, marginLeft: 0, duration: 0.55 } : { height: 0, marginTop: 0, duration: 0.45 }, 0.18)
        .to(mark, { scale: wide ? 1.08 : 1.15, rotate: 360, duration: 0.8, ease: "power3.inOut" }, 0.12);
      tl.progress(collapsed ? 1 : 0);
      return () => {
        tl?.kill();
        tl = null;
      };
    });

    apply(window.scrollY > COLLAPSE_AT, true);
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        if (!collapsed && y > COLLAPSE_AT) apply(true);
        else if (collapsed && y < EXPAND_AT) apply(false);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      mm.revert();
    };
  }, []);

  return (
    <Link
      ref={ref}
      to="/"
      aria-label={NAME}
      data-collapsed="false"
      className="group/brand flex min-h-11 flex-col items-center justify-center sm:flex-row"
    >
      <img
        data-brand-mark
        src="/mark.svg"
        alt=""
        className="size-9 shrink-0 outline-none drop-shadow-[0_0_14px_rgb(224_138_46_/_0.35)] transition-[filter] duration-500 group-hover/brand:drop-shadow-[0_0_20px_rgb(242_193_75_/_0.6)] sm:size-11"
      />
      <span
        data-brand-wide
        aria-hidden
        className="ml-3 hidden overflow-hidden whitespace-nowrap font-display text-base font-semibold uppercase leading-none tracking-wide sm:block lg:text-lg"
      >
        <Chars text="Geneva University" className="block py-0.5 text-paper" />
        <Chars text="Commodities Club" className="mt-0.5 block py-0.5 text-copper" />
      </span>
      <span
        data-brand-narrow
        aria-hidden
        className="mt-1 block overflow-hidden whitespace-nowrap font-display text-[11px] font-semibold uppercase leading-none tracking-[0.32em] sm:hidden"
      >
        <Chars text="GUCC" className="block py-0.5 pl-[0.32em] text-wheat" />
      </span>
    </Link>
  );
}
