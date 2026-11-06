import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function BrandMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="Geneva University Commodities Club"
      className={cn("inline-flex items-center rounded-lg", className)}
    >
      <img
        src="/logo.png"
        alt=""
        className={cn("w-auto outline-none", compact ? "h-11" : "h-14 sm:h-16")}
      />
    </Link>
  );
}
