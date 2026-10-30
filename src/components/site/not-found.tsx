import { Link } from "@tanstack/react-router";
import { Shell } from "@/components/site/shell";

/** Shown for unknown URLs (also prerendered as the static 404.html shell). */
export function NotFound() {
  return (
    <Shell>
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="mx-auto flex min-h-[70svh] max-w-6xl flex-col justify-center px-6 py-32">
          <p className="font-display text-xs uppercase tracking-widest text-copper">Error 404</p>
          <h1 className="mt-4 font-display text-4xl font-semibold uppercase leading-[0.92] tracking-tight sm:text-7xl">
            Page not found
          </h1>
          <p className="mt-6 max-w-xl font-serif text-lg text-paper/70">
            The page you are looking for does not exist or has moved.
          </p>
          <Link
            to="/"
            className="mt-10 inline-flex w-fit items-center gap-2 font-display text-sm uppercase tracking-widest text-copper hover:text-paper"
          >
            Back to home →
          </Link>
        </div>
      </section>
    </Shell>
  );
}
