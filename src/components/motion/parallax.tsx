import { useEffect, useRef, type ReactNode } from "react";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Scroll parallax: the inner layer drifts by `amount` (percent of its height)
 * while the frame scrolls through the viewport. Optional clip reveal on entry.
 */
export function Parallax({
  children,
  className,
  innerClassName,
  amount = 12,
  reveal = false,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  amount?: number;
  reveal?: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !frame.current || !inner.current) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner.current,
        { yPercent: -amount / 2, scale: 1 + amount / 100 },
        {
          yPercent: amount / 2,
          scale: 1 + amount / 100,
          ease: "none",
          scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
      if (reveal) {
        gsap.fromTo(
          frame.current,
          { clipPath: "inset(12% 8% 12% 8% round 24px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 12px)",
            ease: "none",
            scrollTrigger: { trigger: frame.current, start: "top 95%", end: "top 35%", scrub: 0.6 },
          },
        );
      }
    }, frame);
    return () => ctx.revert();
  }, [amount, reveal]);

  return (
    <div ref={frame} className={cn("overflow-hidden", className)}>
      <div ref={inner} className={cn("size-full will-change-transform", innerClassName)}>
        {children}
      </div>
    </div>
  );
}
