import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Linkedin } from "lucide-react";
import { useEffect, useRef } from "react";
import { Parallax } from "@/components/motion/parallax";
import { SplitText } from "@/components/motion/split-text";
import { PageHero } from "@/components/pages/page-hero";
import { CtaOrb } from "@/components/site/cta-orb";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";
import { ensureGsap, prefersReducedMotion } from "@/lib/motion";
import { formatNewsDate, LINKEDIN_COMPANY_URL, NEWS, type NewsItem } from "@/lib/news";
import { newsPage as P } from "@/lib/pages";

export function NewsPage() {
  const { t, lang } = useLanguage();
  useEffect(() => {
    document.title = P.meta[lang];
  }, [lang]);
  const featured = NEWS[0];

  return (
    <div className="bg-ink text-paper">
      <PageHero index="04 / 06" kicker={P.kicker[lang]} title={P.title[lang]} lead={P.lead[lang]} visual={<NewsStack />}>
        <Button asChild size="lg" variant="secondary" className="mt-8">
          <a href={LINKEDIN_COMPANY_URL} target="_blank" rel="noreferrer">
            <Linkedin className="size-4" />
            {t.news.follow}
          </a>
        </Button>
      </PageHero>

      {featured ? (
        <section className="border-t border-copper/20 bg-navy">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
            <Reveal>
              <p className="flex items-center gap-3 font-display text-xs uppercase tracking-widest text-copper">
                <span className="live-dot size-2 rounded-full bg-up" aria-hidden />
                {P.latest[lang]}
              </p>
            </Reveal>
            <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              {featured.image ? (
                <Reveal>
                  <div data-tilt="6" className="glow-card overflow-hidden rounded-2xl shadow-[0_0_0_1px_rgb(224_138_46_/_0.35),0_50px_100px_rgb(0_0_0_/_0.45)]">
                    <Parallax reveal amount={12} className="aspect-[16/10]">
                      <img src={featured.image} alt={featured.title[lang]} className="size-full object-cover outline-none" />
                    </Parallax>
                  </div>
                </Reveal>
              ) : null}
              <div>
                <Reveal delay={100}>
                  <Meta item={featured} />
                </Reveal>
                <SplitText
                  text={featured.title[lang]}
                  className="mt-5 font-display text-4xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-5xl"
                />
                <Reveal delay={200}>
                  <p className="mt-6 font-serif text-lg leading-relaxed text-ice">{featured.summary[lang]}</p>
                  <ItemLink item={featured} className="mt-8" />
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <Timeline />

      <section className="relative overflow-hidden border-t border-copper/20 bg-navy">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-4 py-24 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-32">
          <div>
            <SplitText text={t.news.follow} className="max-w-xl font-display text-4xl font-semibold uppercase leading-none tracking-tight sm:text-6xl" />
            <Reveal delay={150}>
              <p className="mt-6 max-w-lg font-serif text-lg leading-relaxed text-ice">{t.news.followLead}</p>
              <p className="mt-6 font-mono text-xs uppercase tracking-widest text-steel">linkedin.com/company/geneva-university-commodities-club</p>
            </Reveal>
          </div>
          <Reveal delay={120} className="flex justify-center pb-12">
            <CtaOrb href={LINKEDIN_COMPANY_URL} label={t.news.follow} ring={P.ring[lang]} icon={<Linkedin className="size-14" />} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function Meta({ item }: { item: NewsItem }) {
  const { lang } = useLanguage();
  return (
    <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-widest">
      <span className="rounded-sm bg-copper px-2 py-0.5 text-ink">{item.tag[lang]}</span>
      <time dateTime={item.date} className="text-steel">
        {formatNewsDate(item.date, lang)}
      </time>
    </div>
  );
}

function ItemLink({ item, className }: { item: NewsItem; className?: string }) {
  const { t } = useLanguage();
  if (item.linkedin) {
    return (
      <Button asChild size="lg" className={className}>
        <a href={item.linkedin} target="_blank" rel="noreferrer">
          <Linkedin className="size-4" /> {t.news.read}
          <ArrowUpRight className="size-4" />
        </a>
      </Button>
    );
  }
  return (
    <Button asChild size="lg" className={className}>
      <Link to={item.href ?? "/"}>
        {t.news.open}
        <ArrowUpRight className="size-4" />
      </Link>
    </Button>
  );
}

/** Vertical timeline whose spine draws itself with the scroll. */
function Timeline() {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-spine]",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 60%", scrub: 0.6 } },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const years = NEWS.map((n) => n.date.slice(0, 4));
  return (
    <section className="border-t border-copper/20 bg-ink">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <Reveal>
          <p className="font-display text-xs uppercase tracking-widest text-copper">{P.timeline[lang]}</p>
        </Reveal>
        <SplitText text={P.title[lang]} className="mt-3 font-display text-4xl font-semibold uppercase leading-none tracking-tight sm:text-5xl" />

        <div ref={ref} className="relative mt-14 pl-10 sm:pl-0">
          <span aria-hidden className="absolute bottom-0 left-3 top-0 w-px bg-paper/10 sm:left-[11rem]" />
          <span aria-hidden data-spine className="absolute bottom-0 left-3 top-0 w-px origin-top bg-gradient-to-b from-wheat via-copper to-copper/0 sm:left-[11rem]" />
          <ol className="space-y-14">
            {NEWS.map((item, i) => (
              <li key={item.id} className="relative sm:grid sm:grid-cols-[11rem_1fr] sm:gap-12">
                <span aria-hidden className="timeline-dot absolute -left-[1.94rem] top-2 size-3 rounded-full bg-wheat sm:left-[calc(11rem-0.36rem)]" />
                <Reveal className="hidden sm:block">
                  <p className="pr-8 text-right font-display text-5xl font-semibold leading-none text-copper/80">{years[i]}</p>
                  <time dateTime={item.date} className="mt-2 block pr-8 text-right font-mono text-xs uppercase tracking-widest text-steel">
                    {formatNewsDate(item.date, lang)}
                  </time>
                </Reveal>
                <Reveal delay={120}>
                  <article
                    data-tilt="5"
                    className="glow-card grid gap-6 overflow-hidden rounded-xl bg-navy p-6 shadow-[0_0_0_1px_rgb(224_138_46_/_0.25)] sm:p-8 md:grid-cols-[1fr_14rem]"
                  >
                    <div>
                      <Meta item={item} />
                      <h3 className="mt-4 font-display text-2xl font-semibold uppercase leading-[0.95] tracking-tight sm:text-3xl">{item.title[lang]}</h3>
                      <p className="mt-3 font-serif text-base leading-relaxed text-ice/90">{item.summary[lang]}</p>
                      <ItemLink item={item} className="mt-6" />
                    </div>
                    {item.image ? (
                      <img src={item.image} alt="" className="aspect-square w-full rounded-lg object-cover outline-none" />
                    ) : null}
                  </article>
                </Reveal>
              </li>
            ))}
            <li className="relative sm:grid sm:grid-cols-[11rem_1fr] sm:gap-12">
              <span aria-hidden className="absolute -left-[1.94rem] top-2 flex size-3 sm:left-[calc(11rem-0.36rem)]">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-copper/70" />
                <span className="relative inline-flex size-3 rounded-full border border-copper bg-ink" />
              </span>
              <div className="hidden sm:block" />
              <Reveal delay={120}>
                <a
                  href={LINKEDIN_COMPANY_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="group block rounded-xl border border-dashed border-copper/40 p-6 transition-colors hover:border-wheat sm:p-8"
                >
                  <p className="font-display text-xs uppercase tracking-widest text-wheat">{P.next[lang]}</p>
                  <p className="mt-3 max-w-lg font-serif text-base leading-relaxed text-ice/90">{P.nextBody[lang]}</p>
                  <ArrowUpRight className="mt-4 size-5 text-wheat transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </a>
              </Reveal>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

/** Hero visual: a floating 3D stack of post cards around an orbit ring. */
function NewsStack() {
  const { lang } = useLanguage();
  const item = NEWS[0];
  return (
    <div aria-hidden className="news-stack relative aspect-square w-[min(30rem,88vw)]">
      <div className="news-orbit absolute inset-[4%] rounded-full border border-dashed border-copper/30" />
      <div className="news-orbit news-orbit-2 absolute inset-[16%] rounded-full border border-wheat/15" />
      <div className="news-plane absolute inset-[14%]">
        {[2, 1].map((k) => (
          <div
            key={k}
            className="news-card absolute inset-0 rounded-2xl bg-navy p-6 shadow-[0_0_0_1px_rgb(224_138_46_/_0.3)]"
            style={{ transform: `translate3d(${k * 34}px, ${-k * 30}px, ${-k * 90}px)`, opacity: 1 - k * 0.25 }}
          >
            <div className="h-3 w-24 rounded bg-paper/15" />
            <div className="mt-4 h-2 w-3/4 rounded bg-paper/10" />
            <div className="mt-2 h-2 w-2/3 rounded bg-paper/10" />
            <Linkedin className="absolute bottom-6 right-6 size-8 text-paper/15" />
          </div>
        ))}
        <div className="news-card news-front absolute inset-0 overflow-hidden rounded-2xl bg-ink shadow-[0_0_0_1px_rgb(242_193_75_/_0.45),0_50px_90px_rgb(0_0_0_/_0.55)]">
          {item?.image ? <img src={item.image} alt="" className="h-[58%] w-full object-cover" /> : <div className="bg-grid h-[58%]" />}
          <div className="p-5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
              <span className="rounded-sm bg-copper px-1.5 py-0.5 text-ink">{item?.tag[lang]}</span>
              <span className="text-steel">{item ? formatNewsDate(item.date, lang) : ""}</span>
            </div>
            <p className="mt-3 line-clamp-2 font-display text-xl font-semibold uppercase leading-[0.95] tracking-tight">{item?.title[lang]}</p>
          </div>
          <span className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-[#0a66c2] text-paper">
            <Linkedin className="size-5" />
          </span>
        </div>
      </div>
    </div>
  );
}
