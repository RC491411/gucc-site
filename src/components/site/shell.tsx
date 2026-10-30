import { type ReactNode } from "react";
import { Footer } from "@/components/site/footer";
import { Nav } from "@/components/site/nav";
import { QuotesProvider, useQuotes } from "@/components/site/quotes-provider";
import { Ticker } from "@/components/site/ticker";

function TickerBar() {
  const quotes = useQuotes();
  return <Ticker quotes={quotes} />;
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <QuotesProvider>
      <div className="min-h-svh bg-ink text-paper">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2 focus:text-ink"
        >
          Skip
        </a>
        <Nav />
        <TickerBar />
        <main id="main">{children}</main>
        <Footer />
      </div>
    </QuotesProvider>
  );
}
