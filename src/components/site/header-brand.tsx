import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";

const NAME = "Geneva University Commodities Club";
const COLLAPSE_AT = 72;
const EXPAND_AT = 36;

/**
 * Centred header brand. At the top of the page: C mark + wordmark to the right
 * (GENEVA UNIVERSITY / COMMODITIES CLUB). On scroll it collapses to the mark only;
 * scrolling back to the top restores the full horizontal brand.
 */
export function HeaderBrand() {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { gsap } = ensureGsap();
    let collapsed = false;
    let tl: gsap.core.Timeline | null = null;

    const full = el.querySelector<HTMLElement>("[data-brand-full]");
    const mark = el.querySelector<HTMLElement>("[data-brand-mark]");
    if (!full || !mark) return;

    tl = gsap.timeline({ paused: true, defaults: { ease: "power3.inOut" } });
    tl.to(full, { autoAlpha: 0, scale: 0.86, duration: 0.35, ease: "power2.in" }, 0)
      .to(mark, { autoAlpha: 1, scale: 1, rotate: 360, duration: 0.7, ease: "power3.inOut" }, 0.08);

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

    gsap.set(mark, { autoAlpha: 0, scale: 0.85, rotate: 0 });
    gsap.set(full, { autoAlpha: 1, scale: 1 });

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
      tl?.kill();
    };
  }, []);

  return (
    <Link
      ref={ref}
      to="/"
      aria-label={NAME}
      data-collapsed="false"
      className="group/brand relative flex h-14 min-w-[3.25rem] items-center justify-center sm:h-16 sm:min-w-[4rem]"
    >
      {/* Expanded: mark + wordmark to the right (no stacked logo.png) */}
      <span
        data-brand-full
        className="flex items-center gap-2.5 outline-none drop-shadow-[0_0_14px_rgb(224_138_46_/_0.28)] transition-[filter] duration-500 group-hover/brand:drop-shadow-[0_0_20px_rgb(242_193_75_/_0.5)] sm:gap-3"
      >
        <img
          src="/mark.png?v=4"
          alt=""
          className="size-9 shrink-0 outline-none sm:size-11"
        />
        <span className="flex min-w-0 flex-col leading-none">
          <span className="font-display text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-paper sm:text-[0.72rem] sm:tracking-[0.16em]">
            Geneva University
          </span>
          <span className="mt-0.5 font-display text-[0.55rem] font-semibold uppercase tracking-[0.14em] text-copper sm:mt-1 sm:text-[0.65rem] sm:tracking-[0.16em]">
            Commodities Club
          </span>
        </span>
      </span>

      {/* Collapsed: mark only (spins in on scroll) */}
      <img
        data-brand-mark
        src="/mark.png?v=4"
        alt=""
        className="pointer-events-none absolute size-9 outline-none drop-shadow-[0_0_14px_rgb(224_138_46_/_0.35)] transition-[filter] duration-500 group-hover/brand:drop-shadow-[0_0_20px_rgb(242_193_75_/_0.6)] sm:size-11"
      />
    </Link>
  );
}
