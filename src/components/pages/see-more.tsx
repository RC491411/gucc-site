import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { seeMore } from "@/lib/pages";
import { cn } from "@/lib/utils";

/** Teaser link from a landing section to its dedicated page. */
export function SeeMore({ to, className, dark = true }: { to: "/missions" | "/markets" | "/news" | "/founders"; className?: string; dark?: boolean }) {
  const { lang } = useLanguage();
  return (
    <Link
      to={to}
      data-magnetic="0.2"
      className={cn(
        "see-more group inline-flex h-12 items-center gap-4 font-display text-sm uppercase tracking-widest",
        dark ? "text-wheat" : "text-ink",
        className,
      )}
    >
      <span className="relative">
        {seeMore[lang]}
        <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-[var(--motion-emphasis)] ease-[var(--ease-smooth-out)] group-hover:scale-x-100" />
      </span>
      <span
        className={cn(
          "flex size-12 items-center justify-center rounded-full transition-[background-color,color,transform] duration-[var(--motion-emphasis)] ease-[var(--ease-smooth-out)] group-hover:translate-x-1",
          dark
            ? "shadow-[0_0_0_1px_rgb(242_193_75_/_0.5)] group-hover:bg-wheat group-hover:text-ink"
            : "shadow-[0_0_0_1px_rgb(12_28_30_/_0.4)] group-hover:bg-ink group-hover:text-paper",
        )}
      >
        <ArrowRight className="size-5" />
      </span>
    </Link>
  );
}
