import { useEffect, useMemo, useRef, useState } from "react";
import { marketsPage as P } from "@/lib/pages";
import { useLanguage } from "@/lib/language";
import {
  mountTradingViewWidget,
  overviewConfig,
  tickerConfig,
  tradingViewUrl,
  TRADINGVIEW_INSTRUMENTS,
  WIDGET_COPY,
  type TradingViewCommodity,
  type WidgetKind,
} from "@/lib/tradingview";

/** A visible fallback is always present: cross-origin data/permission failures
 * cannot be reliably detected by a script load event, so we never claim success.
 */
function TradingViewWidget({
  kind,
  commodity,
  lazy = false,
}: {
  kind: WidgetKind;
  commodity?: TradingViewCommodity;
  lazy?: boolean;
}) {
  const { lang } = useLanguage();
  const anchor = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(!lazy);
  const [failed, setFailed] = useState(false);
  const copy = WIDGET_COPY[lang];
  const config = useMemo(
    () => (commodity ? overviewConfig(commodity, lang) : tickerConfig(lang)),
    [commodity, lang],
  );
  const sourceUrl = commodity ? tradingViewUrl(commodity) : tradingViewUrl("COPPER");
  const attribution = commodity
    ? `${TRADINGVIEW_INSTRUMENTS[commodity].symbol} · Capital.com CFD`
    : "Capital.com commodity CFDs";

  useEffect(() => {
    if (!lazy || typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const el = anchor.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy]);

  useEffect(() => {
    if (!near || !host.current) return;
    setFailed(false);
    return mountTradingViewWidget(host.current, kind, config, sourceUrl, attribution, () =>
      setFailed(true),
    );
  }, [near, kind, config, sourceUrl, attribution]);

  return (
    <div ref={anchor} data-tv-widget={kind} data-tv-commodity={commodity}>
      <div
        ref={host}
        hidden={failed}
        className={kind === "symbol-overview" ? "min-w-0 min-h-[352px]" : "min-w-0 min-h-[78px]"}
      />
      {failed ? (
        <p role="status" className="mt-2 font-mono text-xs text-steel">
          {copy.blocked}
        </p>
      ) : null}
      {commodity ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block font-mono text-[11px] leading-relaxed text-ice underline underline-offset-4"
        >
          {copy.fallback}
        </a>
      ) : (
        <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] text-ice">
          <span>{copy.fallback}:</span>
          {(Object.keys(TRADINGVIEW_INSTRUMENTS) as TradingViewCommodity[]).map((key) => (
            <a
              key={key}
              href={tradingViewUrl(key)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              {lang === "fr"
                ? TRADINGVIEW_INSTRUMENTS[key].nameFr
                : TRADINGVIEW_INSTRUMENTS[key].nameEn}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function TradingViewCommodityCard({
  commodity,
  delay,
}: {
  commodity: TradingViewCommodity;
  delay: number;
}) {
  const { lang } = useLanguage();
  const copy = WIDGET_COPY[lang];
  const instrument = TRADINGVIEW_INSTRUMENTS[commodity];
  return (
    <article
      style={{ animationDelay: `${delay}ms` }}
      className="board-in min-w-0 rounded-xl bg-navy p-4 shadow-[0_0_0_1px_rgb(224_138_46_/_0.22)] sm:p-6"
    >
      <h3 className="font-display text-3xl font-semibold uppercase tracking-tight text-wheat">
        {commodity}
      </h3>
      <p className="mt-1 font-serif text-sm text-ice">
        {lang === "fr" ? instrument.nameFr : instrument.nameEn}
      </p>
      <p className="my-3 font-mono text-[11px] leading-relaxed text-steel">{copy.status}</p>
      <TradingViewWidget kind="symbol-overview" commodity={commodity} lazy />
      <p className="mt-4 font-mono text-[10px] leading-relaxed text-steel">{copy.native}</p>
      <p className="mt-5 border-t border-paper/10 pt-4 font-serif text-sm leading-relaxed text-ice/90">
        {P.commodities[commodity]?.[lang]}
      </p>
    </article>
  );
}

export function TradingViewTargetsTicker() {
  const { lang } = useLanguage();
  return (
    <section
      aria-label={WIDGET_COPY[lang].ticker}
      className="border-b border-paper/10 bg-ink px-4 py-3 sm:px-6"
    >
      <p className="mb-2 font-mono text-[10px] leading-relaxed text-steel">
        {WIDGET_COPY[lang].status}
      </p>
      <TradingViewWidget kind="ticker-tape" />
    </section>
  );
}
