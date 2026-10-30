import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import Lenis from "lenis";
import { ensureGsap, prefersReducedMotion, richMotion, scrollState, setLenis } from "@/lib/motion";

/**
 * Global motion layer mounted once in the root:
 * Lenis smooth scroll synced to GSAP ScrollTrigger, scroll progress bar,
 * custom cursor, magnetic elements ([data-magnetic]), 3D tilt with glare ([data-tilt])
 * and a curtain transition between routes.
 */
export function MotionRoot() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [rich, setRich] = useState(false);

  useEffect(() => {
    const update = () => setRich(richMotion());
    update();
    const a = window.matchMedia("(prefers-reduced-motion: reduce)");
    const b = window.matchMedia("(hover: hover) and (pointer: fine)");
    a.addEventListener("change", update);
    b.addEventListener("change", update);
    return () => {
      a.removeEventListener("change", update);
      b.removeEventListener("change", update);
    };
  }, []);

  useSmoothScroll(!prefersReducedMotionSafe());
  useMagnetic(rich);
  useTilt(rich);

  useEffect(() => {
    document.documentElement.classList.toggle("has-rich-motion", rich);
  }, [rich]);

  return (
    <>
      <ScrollProgress />
      {rich ? <Cursor /> : null}
      <RouteCurtain pathname={pathname} />
    </>
  );
}

function prefersReducedMotionSafe() {
  return typeof window === "undefined" ? true : prefersReducedMotion();
}

function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    const { gsap, ScrollTrigger } = ensureGsap();
    if (!enabled) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: true,
    });
    setLenis(lenis);
    document.documentElement.style.scrollBehavior = "auto";
    lenis.on("scroll", (l: Lenis) => {
      scrollState.velocity = l.velocity;
      ScrollTrigger.update();
    });
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
      document.documentElement.style.scrollBehavior = "";
    };
  }, [enabled]);
}

function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div
        ref={ref}
        className="h-full origin-left bg-gradient-to-r from-copper via-wheat to-copper shadow-[0_0_12px_rgb(242_193_75_/_0.7)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let visible = false;
    let raf = 0;
    const root = document.documentElement;
    root.classList.add("custom-cursor");

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        dot.current?.classList.add("is-visible");
        ring.current?.classList.add("is-visible");
      }
      const target = e.target as Element | null;
      const interactive = target?.closest("a, button, [role='button'], [data-cursor], label, select");
      const text = target?.closest("input, textarea");
      ring.current?.classList.toggle("is-hover", !!interactive && !text);
      ring.current?.classList.toggle("is-text", !!text);
      dot.current?.classList.toggle("is-text", !!text);
    };
    const onLeave = () => {
      visible = false;
      dot.current?.classList.remove("is-visible");
      ring.current?.classList.remove("is-visible");
    };
    const onDown = () => ring.current?.classList.add("is-down");
    const onUp = () => ring.current?.classList.remove("is-down");
    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <>
      <div ref={ring} aria-hidden className="gucc-cursor-ring">
        <span />
      </div>
      <div ref={dot} aria-hidden className="gucc-cursor-dot">
        <span />
      </div>
    </>
  );
}

/** Elements with [data-magnetic] lean towards the pointer. */
function useMagnetic(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const { gsap } = ensureGsap();
    let current: HTMLElement | null = null;
    const release = (el: HTMLElement) => {
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    };
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (current && current !== el) release(current);
      current = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const strength = Number(el.dataset.magnetic) || 0.35;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.4, ease: "power3.out" });
    };
    const onLeave = () => {
      if (current) release(current);
      current = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (current) gsap.set(current, { x: 0, y: 0 });
    };
  }, [enabled]);
}

/** Elements with [data-tilt] rotate in 3D under the pointer, with a moving glare. */
function useTilt(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let current: HTMLElement | null = null;
    const reset = (el: HTMLElement) => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--go", "0");
      el.classList.remove("is-tilting");
    };
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (current && current !== el) reset(current);
      current = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const max = Number(el.dataset.tilt) || 8;
      el.classList.add("is-tilting");
      el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
      el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
      el.style.setProperty("--gx", `${px * 100}%`);
      el.style.setProperty("--gy", `${py * 100}%`);
      el.style.setProperty("--go", "1");
    };
    const onLeave = () => {
      if (current) reset(current);
      current = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      if (current) reset(current);
    };
  }, [enabled]);
}

/** A navy curtain carrying the club mark that lifts off each new page. */
function RouteCurtain({ pathname }: { pathname: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const prev = useRef(pathname);

  useEffect(() => {
    if (prev.current === pathname) return;
    prev.current = pathname;
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap, ScrollTrigger } = ensureGsap();
    const tl = gsap.timeline({ onComplete: () => ScrollTrigger.refresh() });
    tl.set(el, { yPercent: 0, autoAlpha: 1 })
      .fromTo(el.querySelector("img"), { scale: 0.6, rotate: -90, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.45, ease: "back.out(1.6)" })
      .to(el, { yPercent: -100, duration: 0.75, ease: "expo.inOut" }, "+=0.1")
      .fromTo("#main", { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out", clearProps: "transform,opacity,visibility" }, "<0.25")
      .set(el, { autoAlpha: 0 });
    return () => {
      tl.kill();
      gsap.set(el, { autoAlpha: 0 });
      gsap.set("#main", { clearProps: "transform,opacity,visibility" });
    };
  }, [pathname]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-navy"
      style={{ visibility: "hidden", opacity: 0 }}
    >
      <div className="absolute inset-0 bg-grid opacity-60" />
      <img src="/mark.svg" alt="" className="relative size-24 outline-none" />
    </div>
  );
}
