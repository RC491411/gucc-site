import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Linkedin } from "lucide-react";
import { Parallax } from "@/components/motion/parallax";
import { SplitText } from "@/components/motion/split-text";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";
import { formatNewsDate, LINKEDIN_COMPANY_URL, NEWS, type NewsItem } from "@/lib/news";
import { cn } from "@/lib/utils";

export function NewsSection() {
  const { t } = useLanguage();
  return (
    <section id="news" className="scroll-mt-24 border-t border-copper/20 bg-navy">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <p className="font-display text-xs uppercase tracking-widest text-copper">{t.news.kicker}</p>
            <SplitText
              text={t.news.title}
              className="mt-3 max-w-2xl font-display text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl"
            />
            <p className="mt-5 max-w-xl font-serif text-lg leading-relaxed text-ice/90">{t.news.lead}</p>
          </Reveal>
          <Reveal delay={120}>
            <Button asChild size="lg" variant="secondary">
              <a href={LINKEDIN_COMPANY_URL} target="_blank" rel="noreferrer">
                <Linkedin className="size-4" />
                {t.news.follow}
              </a>
            </Button>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          {NEWS[0] ? (
            <Reveal className="h-full">
              <NewsCard item={NEWS[0]} featured />
            </Reveal>
          ) : null}
          <div className="grid gap-5">
            {NEWS.slice(1, 3).map((item, i) => (
              <Reveal key={item.id} delay={120 + i * 120} className="h-full">
                <NewsCard item={item} />
              </Reveal>
            ))}
            <Reveal delay={360} className="h-full">
              <a
                href={LINKEDIN_COMPANY_URL}
                target="_blank"
                rel="noreferrer"
                data-tilt="8"
                className="glow-card group relative flex h-full min-h-48 flex-col justify-between overflow-hidden rounded-xl bg-[#0a66c2]/15 p-6 text-paper shadow-[0_0_0_1px_rgb(242_193_75_/_0.35)]"
              >
                <Linkedin className="absolute -right-6 -top-6 size-40 text-paper/5 transition-transform duration-[1200ms] ease-[var(--ease-smooth-out)] group-hover:rotate-12 group-hover:scale-110" />
                <div className="relative flex items-center gap-3">
                  <span className="live-dot size-2 rounded-full bg-up" aria-hidden />
                  <span className="font-mono text-xs uppercase tracking-widest text-steel">linkedin.com/company/geneva-university-commodities-club</span>
                </div>
                <div className="relative">
                  <p className="font-display text-2xl font-semibold uppercase leading-none tracking-tight">{t.news.follow}</p>
                  <p className="mt-3 max-w-sm font-serif text-sm leading-relaxed text-ice/90">{t.news.followLead}</p>
                </div>
                <ArrowUpRight className="relative size-6 text-wheat transition-transform duration-[var(--motion-emphasis)] group-hover:-translate-y-1 group-hover:translate-x-1" />
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  const { t, lang } = useLanguage();
  const body = (
    <>
      {item.image ? (
        <Parallax amount={10} className={cn("relative rounded-t-xl", featured ? "aspect-[16/10]" : "aspect-[16/7]")}>
          <img src={item.image} alt={item.title[lang]} className="size-full object-cover outline-none" />
        </Parallax>
      ) : null}
      <div className={cn("flex flex-1 flex-col p-6", featured && "sm:p-8")}>
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-widest">
          <span className="rounded-sm bg-copper px-2 py-0.5 text-ink">{item.tag[lang]}</span>
          <time dateTime={item.date} className="text-steel">
            {formatNewsDate(item.date, lang)}
          </time>
        </div>
        <h3
          className={cn(
            "mt-4 font-display font-semibold uppercase leading-[0.95] tracking-tight",
            featured ? "text-3xl sm:text-4xl" : "text-2xl",
          )}
        >
          {item.title[lang]}
        </h3>
        <p className="mt-3 font-serif text-sm leading-relaxed text-ice/90 sm:text-base">{item.summary[lang]}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-5 font-display text-sm uppercase tracking-widest text-wheat">
          {item.linkedin ? (
            <>
              <Linkedin className="size-4" /> {t.news.read}
            </>
          ) : (
            t.news.open
          )}
          <ArrowUpRight className="size-4 transition-transform duration-[var(--motion-emphasis)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </>
  );
  const cls =
    "glow-card group flex h-full flex-col overflow-hidden rounded-xl bg-ink text-paper shadow-[0_0_0_1px_rgb(224_138_46_/_0.28)]";
  if (item.linkedin) {
    return (
      <a href={item.linkedin} target="_blank" rel="noreferrer" data-tilt="6" className={cls}>
        {body}
      </a>
    );
  }
  return (
    <Link to={item.href ?? "/"} data-tilt="6" className={cls}>
      {body}
    </Link>
  );
}
