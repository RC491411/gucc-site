import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/**
 * Side menu / footer brand: C mark on the left, wordmark to the RIGHT
 * (GENEVA UNIVERSITY / COMMODITIES CLUB) — same layout as HeaderBrand.
 * Colors: paper white + copper.
 */
export function BrandMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="Geneva University Commodities Club"
      className={cn("inline-flex items-center gap-2.5 rounded-lg outline-none sm:gap-3", className)}
    >
      <img
        src="/mark.png"
        alt=""
        className={cn("shrink-0 outline-none", compact ? "size-9" : "size-11 sm:size-12")}
      />
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "font-display font-semibold uppercase tracking-[0.14em] text-paper",
            compact ? "text-[0.62rem]" : "text-[0.62rem] sm:text-[0.72rem] sm:tracking-[0.16em]",
          )}
        >
          Geneva University
        </span>
        <span
          className={cn(
            "mt-0.5 font-display font-semibold uppercase tracking-[0.14em] text-copper",
            compact ? "text-[0.55rem]" : "text-[0.55rem] sm:mt-1 sm:text-[0.65rem] sm:tracking-[0.16em]",
          )}
        >
          Commodities Club
        </span>
      </span>
    </Link>
  );
}
