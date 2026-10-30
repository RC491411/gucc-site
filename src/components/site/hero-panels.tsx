import { useState } from "react";
import { heroPanels } from "@/lib/content";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

export function HeroPanels() {
  const { t, lang } = useLanguage();
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(1);

  return (
    <section className="bg-ink">
      <div className="relative flex flex-col items-center overflow-hidden px-6 py-14 sm:py-20">
        <div className="bg-grid absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(224_138_46_/_0.18),transparent_62%)]" />
        <img src="/mark.svg" alt="" className="relative size-24 outline-none drop-pulse sm:size-32" />
        <p className="relative mt-6 text-center font-display text-4xl font-semibold uppercase leading-none tracking-tight text-paper sm:text-6xl">
          Geneva University
        </p>
        <p className="relative mt-2 text-center font-display text-4xl font-semibold uppercase leading-none tracking-tight text-copper sm:text-6xl">
          Commodities Club
        </p>
        <p className="relative mt-6 text-center font-display text-sm uppercase tracking-widest text-wheat sm:text-base">
          {t.hero.tagline}
        </p>
        <h1 className="relative mt-4 max-w-3xl text-center font-display text-2xl font-semibold uppercase leading-none tracking-tight text-paper sm:text-4xl">
          {t.hero.title}
        </h1>
        <p className="relative mt-5 max-w-xl text-center font-serif text-sm leading-relaxed text-ice sm:text-base">
          {t.hero.lead}
        </p>
        <p className="relative mt-8 max-w-xl text-center font-serif text-sm leading-relaxed text-wheat sm:text-base">
          {t.hero.place}
        </p>
      </div>

      <div className="flex min-h-96 flex-col md:h-[28rem] lg:h-[34rem] md:flex-row">
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
                  : "transition-[flex-grow] duration-[var(--motion-slow)] ease-[var(--ease-smooth-out)]",
                on ? "flex-[2.6]" : "flex-1",
              )}
              aria-pressed={on}
            >
              <img
                src={panel.image}
                alt={panel.title[lang]}
                className={cn(
                  "absolute inset-0 size-full object-cover outline-none transition-transform duration-[var(--motion-emphasis)] ease-[var(--ease-out)]",
                  on && !reduced ? "scale-105" : "scale-100",
                )}
              />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent transition-opacity duration-[var(--motion-fast)]",
                  on ? "opacity-100" : "opacity-70",
                )}
              />
              <div className="relative flex h-full min-h-64 flex-col justify-end p-5 sm:p-8 md:min-h-full">
                <p className="font-display text-xs uppercase tracking-widest text-wheat">{panel.kicker[lang]}</p>
                <h2 className="mt-1 font-display text-3xl font-semibold uppercase tracking-wide text-paper sm:text-5xl">
                  {panel.title[lang]}
                </h2>
                <p
                  className={cn(
                    "mt-3 max-w-md font-serif text-sm leading-relaxed text-ice sm:text-base",
                    "md:transition-[opacity,transform,filter] md:duration-[var(--motion-fast)] md:ease-[var(--ease-smooth-out)]",
                    on
                      ? "translate-y-0 opacity-100 blur-0"
                      : "md:pointer-events-none md:translate-y-2 md:opacity-0 md:blur-[4px]",
                  )}
                >
                  {panel.body[lang]}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
