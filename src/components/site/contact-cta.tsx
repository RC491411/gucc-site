import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/language";

/**
 * Big magnetic orb that leads to the contact form: rotating text ring,
 * pulsing halos and an arrow that flips on hover.
 */
export function ContactCta() {
  const { t } = useLanguage();
  const ring = t.join.ring.repeat(2);
  return (
    <Link
      to="/contact"
      search={{ interest: "join" }}
      data-magnetic="0.25"
      aria-label={t.join.cta}
      className="cta-orb group relative flex size-72 items-center justify-center rounded-full sm:size-80"
    >
      <span aria-hidden className="cta-halo absolute inset-0 rounded-full" />
      <span aria-hidden className="cta-halo cta-halo-2 absolute inset-0 rounded-full" />
      <svg aria-hidden viewBox="0 0 200 200" className="cta-ring absolute inset-0 size-full">
        <defs>
          <path id="cta-circle" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
        </defs>
        <text className="fill-wheat font-display text-[11.5px] uppercase">
          <textPath href="#cta-circle" textLength={512} lengthAdjust="spacing">
            {ring}
          </textPath>
        </text>
      </svg>
      <span className="relative flex size-40 items-center justify-center rounded-full bg-copper text-ink shadow-[0_0_60px_rgb(224_138_46_/_0.45)] transition-[background-color,transform,box-shadow] duration-[var(--motion-emphasis)] ease-[var(--ease-smooth-out)] group-hover:scale-110 group-hover:bg-wheat group-hover:shadow-[0_0_90px_rgb(242_193_75_/_0.6)] sm:size-44">
        <span className="relative size-14 overflow-hidden">
          <ArrowUpRight className="absolute inset-0 size-14 transition-transform duration-[var(--motion-emphasis)] ease-[var(--ease-smooth-out)] group-hover:-translate-y-full group-hover:translate-x-full" />
          <ArrowUpRight className="absolute inset-0 size-14 -translate-x-full translate-y-full transition-transform duration-[var(--motion-emphasis)] ease-[var(--ease-smooth-out)] group-hover:translate-x-0 group-hover:translate-y-0" />
        </span>
      </span>
      <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-sm uppercase tracking-widest text-wheat transition-colors group-hover:text-paper">
        {t.join.cta}
      </span>
    </Link>
  );
}
