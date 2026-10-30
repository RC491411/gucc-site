import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#%";

/**
 * Numbers count up when they enter the viewport; words decode from scrambled
 * trading glyphs. The final text is always exactly the given value.
 */
export function CountUp(props: { value: string; className?: string }) {
  return <CountUpInner key={props.value} {...props} />;
}

function CountUpInner({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const numeric = /^\d+$/.test(value);
    const run = () => {
      const start = performance.now();
      const duration = numeric ? 1600 : 1100;
      const target = Number(value);
      const from = numeric ? (target > 1000 ? target - 40 : 0) : 0;
      const frame = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        if (numeric) {
          el.textContent = String(Math.round(from + (target - from) * eased));
        } else {
          const settled = Math.floor(eased * value.length);
          let out = value.slice(0, settled);
          for (let i = settled; i < value.length; i++) {
            out += value[i] === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          el.textContent = out;
        }
        if (t < 1) raf = requestAnimationFrame(frame);
        else el.textContent = value;
      };
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
  }, [value]);

  return (
    <span ref={ref} className={className} aria-label={value}>
      {value}
    </span>
  );
}
