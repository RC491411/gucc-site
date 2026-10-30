import { createElement, Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  /** "words" slides each word up from a mask, "chars" does it per letter. */
  by?: "words" | "chars";
  delay?: number;
  stagger?: number;
  /** Animate on mount instead of when scrolled into view. */
  immediate?: boolean;
};

/**
 * Masked split text reveal. Text stays real text for screen readers (aria-label),
 * and re-renders cleanly when the language changes.
 */
export function SplitText({ text, as = "h2", className, by = "words", delay = 0, stagger, immediate }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  const step = stagger ?? (by === "chars" ? 28 : 55);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setOn(true);
      return;
    }
    if (immediate) {
      const id = requestAnimationFrame(() => setOn(true));
      return () => cancelAnimationFrame(id);
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);

  const words = text.split(" ");
  let index = 0;
  const children = words.map((word, wi) => {
    const parts = by === "chars" ? Array.from(word) : [word];
    return (
      <Fragment key={`${word}-${wi}`}>
      <span className="split-word" aria-hidden>
        {parts.map((p, pi) => {
          const i = index++;
          return (
            <span key={pi} className="split-mask">
              <span className="split-inner" style={{ "--d": `${delay + i * step}ms` } as CSSProperties}>
                {p}
              </span>
            </span>
          );
        })}
      </span>
      {wi < words.length - 1 ? " " : null}
      </Fragment>
    );
  });

  return createElement(
    as,
    { ref, className: cn("split", on && "is-in", className), "aria-label": text },
    children,
  );
}
