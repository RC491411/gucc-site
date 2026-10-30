import { Link } from "@tanstack/react-router";
import { ArrowLeft, Linkedin } from "lucide-react";
import { Parallax } from "@/components/motion/parallax";
import { SplitText } from "@/components/motion/split-text";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { founders } from "@/lib/content";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

export function TeamPage() {
  const { t, lang } = useLanguage();
  return (
    <div className="bg-ink text-paper">
      <div className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
          <Link
            to="/"
            hash="fondateurs"
            className="inline-flex h-11 items-center gap-2 font-display text-sm uppercase tracking-widest text-copper hover:text-wheat"
          >
            <ArrowLeft className="size-4" />
            {t.team.back}
          </Link>
          <p className="mt-10 font-display text-xs uppercase tracking-widest text-copper">{t.team.kicker}</p>
          <SplitText
            as="h1"
            immediate
            delay={150}
            text={t.team.title}
            className="mt-3 max-w-3xl font-display text-4xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-7xl"
          />
          <Reveal delay={400}>
            <p className="mt-6 max-w-2xl font-serif text-lg leading-relaxed text-ice">{t.team.lead}</p>
          </Reveal>
          <nav className="mt-8 flex flex-wrap gap-2">
            {founders.map((f, i) => (
              <Reveal key={f.id} delay={500 + i * 80}>
                <a
                  href={`#${f.id}`}
                  data-magnetic="0.25"
                  className="inline-flex h-10 items-center gap-2 rounded-md px-3 font-display text-xs uppercase tracking-widest text-ice shadow-[0_0_0_1px_rgb(224_138_46_/_0.35)] hover:text-wheat"
                >
                  <span className="font-mono text-wheat">{String(i + 1).padStart(2, "0")}</span> {f.name}
                </a>
              </Reveal>
            ))}
          </nav>
          <Reveal delay={600}>
            <figure className="mt-12">
              <Parallax reveal amount={14} className="aspect-[21/9] rounded-xl">
                <img src="/founders-group.jpg" alt={t.founders.photoCaption} className="size-full object-cover object-[50%_30%]" />
              </Parallax>
              <figcaption className="mt-3 px-1 font-display text-xs uppercase tracking-widest text-steel">
                {t.founders.photoCaption}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>

      {founders.map((f, i) => {
        const flip = i % 2 === 1;
        return (
          <section
            key={f.id}
            id={f.id}
            className={cn("scroll-mt-24 border-t border-copper/20", i % 2 ? "bg-navy" : "bg-ink")}
          >
            <div
              className={cn(
                "mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:py-24",
                flip && "lg:grid-cols-[1.2fr_0.8fr]",
              )}
            >
              <div className={cn("lg:sticky lg:top-28 lg:self-start", flip && "lg:order-2")}>
                <Reveal>
                  <div
                    data-tilt="10"
                    className="glow-card relative aspect-[4/5] overflow-hidden rounded-2xl bg-navy shadow-[0_40px_80px_-30px_rgb(0_0_0_/_0.7),0_0_0_1px_rgb(224_138_46_/_0.35)]"
                  >
                    <img src={f.image} alt={f.name} className="size-full object-cover object-top outline-none" />
                    <p className="absolute left-4 top-4 rounded-md bg-ink/80 px-3 py-1 font-display text-4xl font-bold leading-none text-wheat backdrop-blur-sm">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                  </div>
                </Reveal>
              </div>
              <div className={cn(flip && "lg:order-1")}>
                <p className="font-display text-xs uppercase tracking-widest text-copper">{f.role[lang]}</p>
                <SplitText
                  as="h2"
                  by="chars"
                  text={f.name}
                  className="mt-3 font-display text-5xl font-semibold uppercase leading-none tracking-tight sm:text-6xl"
                />
                <Reveal delay={150}>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {f.facts[lang].map((fact) => (
                      <li
                        key={fact}
                        className="rounded-md bg-paper/5 px-3 py-1.5 font-display text-xs uppercase tracking-wider text-paper shadow-[0_0_0_1px_rgb(224_138_46_/_0.3)]"
                      >
                        {fact}
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <p className="mt-10 font-display text-xs uppercase tracking-widest text-wheat">{t.team.background}</p>
                <div className="mt-4 space-y-5">
                  {f.long[lang].map((para, k) => (
                    <Reveal key={k} delay={k * 60}>
                      <p className="font-serif text-base leading-relaxed text-ice/90 sm:text-lg">{para}</p>
                    </Reveal>
                  ))}
                </div>
                <Reveal>
                  <Button asChild variant="secondary" className="mt-8">
                    <a href={f.linkedin} target="_blank" rel="noreferrer">
                      <Linkedin className="size-4" />
                      {t.team.linkedin}
                    </a>
                  </Button>
                </Reveal>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
