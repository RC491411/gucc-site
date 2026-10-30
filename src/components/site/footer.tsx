import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/site/brand-mark";
import { useLanguage } from "@/lib/language";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-copper/25 bg-ink">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div data-magnetic="0.2" className="w-fit">
            <BrandMark />
          </div>
          <p className="font-serif text-sm text-steel">{t.footer.indep}</p>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 lg:justify-end">
            {(["/missions", "/markets", "/news", "/founders", "/contact"] as const).map((to) => (
              <Link
                key={to}
                to={to}
                className="font-display text-sm uppercase tracking-widest text-wheat underline-offset-4 hover:underline"
              >
                {t.nav[to.slice(1) as "missions" | "markets" | "news" | "founders" | "contact"]}
              </Link>
            ))}
          </nav>
          <a href="mailto:gucc@unige.ch" className="font-mono text-xs text-ice hover:text-wheat">
            gucc@unige.ch
          </a>
          <p className="font-mono text-xs text-steel">© 2026 {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
