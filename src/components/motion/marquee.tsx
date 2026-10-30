import { useEffect, useRef } from "react";
import { ensureGsap, prefersReducedMotion, scrollState } from "@/lib/motion";

/**
 * Giant outlined brand marquee that speeds up and reverses with scroll velocity.
 */
export function Marquee({ text }: { text: string }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const tween = gsap.to(el, { xPercent: -50, ease: "none", duration: 38, repeat: -1 });
    let dir = 1;
    const tick = () => {
      const v = scrollState.velocity;
      if (Math.abs(v) > 0.5) dir = v > 0 ? 1 : -1;
      const target = dir * (1 + Math.min(Math.abs(v) / 6, 5));
      tween.timeScale(gsap.utils.interpolate(tween.timeScale(), target, 0.08));
      el.style.setProperty("--skew", `${Math.max(-8, Math.min(8, -v * 0.35))}deg`);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      tween.kill();
    };
  }, []);

  const item = (
    <span className="flex shrink-0 items-center">
      {[0, 1, 2].map((i) => (
        <span key={i} className="flex items-center">
          <span className={i % 2 ? "marquee-solid" : "marquee-outline"}>{text}</span>
          <img src="/mark.svg" alt="" className="mx-8 size-12 outline-none sm:mx-12 sm:size-16" />
        </span>
      ))}
    </span>
  );

  return (
    <div aria-hidden className="relative overflow-hidden border-y border-copper/20 bg-ink py-8 sm:py-12">
      <div ref={track} className="marquee-track flex w-max">
        {item}
        {item}
      </div>
    </div>
  );
}
