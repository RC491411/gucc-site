import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function BrandMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      to="/"
      className={cn(
        "flex min-h-11 items-center gap-2.5 rounded-lg bg-paper px-2.5 py-1.5 text-ink shadow-[0_0_0_1px_rgb(224_138_46_/_0.35)]",
        className,
      )}
    >
      <img src="/mark.svg" alt="" className={compact ? "size-8 outline-none" : "size-10 outline-none sm:size-11"} />
      <span className="hidden leading-none md:block">
        <span className="block font-display text-xs font-semibold uppercase tracking-wide sm:text-base">
          Geneva University
        </span>
        <span className="mt-0.5 block font-display text-xs font-semibold uppercase tracking-wide text-copper sm:text-base">
          Commodities Club
        </span>
      </span>
    </Link>
  );
}
