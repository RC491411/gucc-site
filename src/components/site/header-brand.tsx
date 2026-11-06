import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";

const NAME = "Geneva University Commodities Club";
const COLLAPSE_AT = 72;
const EXPAND_AT = 36;

/**
 * Centred header logo. At the top of the page the full official brand mark is shown;
 * once the page scrolls, it collapses to the C+droplet mark only. Scrolling back to the
 * top restores the full logo.
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
      <img
        data-brand-full
        src="/logo.png"
        alt=""
        className="h-12 w-auto max-w-[min(52vw,14rem)] outline-none drop-shadow-[0_0_14px_rgb(224_138_46_/_0.28)] transition-[filter] duration-500 group-hover/brand:drop-shadow-[0_0_20px_rgb(242_193_75_/_0.5)] sm:h-14 sm:max-w-[16rem]"
      />
      <img
        data-brand-mark
        src="/mark.png"
        alt=""
        className="pointer-events-none absolute size-9 outline-none drop-shadow-[0_0_14px_rgb(224_138_46_/_0.35)] transition-[filter] duration-500 group-hover/brand:drop-shadow-[0_0_20px_rgb(242_193_75_/_0.6)] sm:size-11"
      />
    </Link>
  );
}
