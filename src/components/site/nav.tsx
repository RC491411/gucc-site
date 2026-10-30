import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/site/brand-mark";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";
import { getLenis } from "@/lib/motion";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#club", key: "club" as const },
  { href: "/#missions", key: "missions" as const },
  { href: "/#fondateurs", key: "founders" as const },
  { href: "/#marches", key: "markets" as const },
  { href: "/#news", key: "news" as const },
];

export function Nav() {
  const { t, lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    return () => {
      document.body.style.overflow = "";
      getLenis()?.start();
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-[background-color,box-shadow] duration-[var(--motion-fast)] ease-[var(--ease-out)]",
          scrolled ? "bg-ink/95 shadow-[0_0_0_1px_rgb(224_138_46_/_0.28)]" : "bg-ink/80",
        )}
      >
        <div className="relative mx-auto flex h-20 max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
          <button
            type="button"
            data-magnetic="0.4"
            className="group/menu z-10 inline-flex size-11 items-center justify-center rounded-md text-paper transition-colors duration-[var(--motion-quick)] hover:text-wheat"
            aria-label={t.nav.menu}
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu className="size-5 transition-transform duration-[var(--motion-emphasis)] ease-[var(--ease-smooth-out)] group-hover/menu:scale-x-125" />
          </button>

          <div className="pointer-events-none absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center">
            <div className="pointer-events-auto">
              <BrandMark compact />
            </div>
          </div>

          <div className="z-10 flex min-w-0 items-center gap-2">
            <Button asChild size="sm">
              <a href="/#rejoindre">{t.nav.join}</a>
            </Button>
            <div className="flex h-11 items-center rounded-md bg-paper/10 px-1 shadow-[0_0_0_1px_rgb(224_138_46_/_0.35)]">
              {(["en", "fr"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  data-magnetic="0.25"
                  onClick={() => setLang(code)}
                  className={cn(
                    "h-8 min-w-9 rounded-sm px-2 font-display text-xs uppercase tracking-widest transition-[background-color,color] duration-[var(--motion-quick)]",
                    lang === code ? "bg-copper text-ink" : "text-ice hover:text-wheat",
                  )}
                  aria-pressed={lang === code}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-50",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label={t.nav.close}
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink/55 transition-opacity duration-[var(--motion-fast)] ease-[var(--ease-out)]",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col bg-navy shadow-[4px_0_40px_rgb(0_0_0_/_0.35)]",
            "transition-transform duration-[var(--motion-slow)] ease-[var(--ease-smooth-out)]",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between gap-3 px-5 py-6">
            <div onClick={() => setOpen(false)}>
              <BrandMark compact />
            </div>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-md text-paper"
              aria-label={t.nav.close}
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </button>
          </div>
          <nav data-lenis-prevent className={cn("menu-links flex flex-1 flex-col gap-1 overflow-y-auto px-6 pb-10 pt-4", open && "is-open")}>
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-center font-serif text-2xl text-paper transition-colors duration-[var(--motion-quick)] hover:text-wheat"
              >
                {t.nav[l.key]}
              </a>
            ))}
            <Link
              to="/team"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="flex min-h-14 items-center font-serif text-2xl text-paper transition-colors duration-[var(--motion-quick)] hover:text-wheat"
            >
              {t.nav.team}
            </Link>
            <Link
              to="/statuts"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="flex min-h-14 items-center font-serif text-2xl text-paper transition-colors duration-[var(--motion-quick)] hover:text-wheat"
            >
              {t.nav.statutes}
            </Link>
            <Link
              to="/contact"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="mt-auto flex min-h-14 items-center font-serif text-2xl text-paper transition-colors duration-[var(--motion-quick)] hover:text-wheat"
            >
              {t.nav.contact}
            </Link>
          </nav>
        </aside>
      </div>
    </>
  );
}
