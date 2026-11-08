/** Official hosted embeds only. No quote extraction, API credentials or unit conversion.
 * Public code examples (no account/copy-code gate needed):
 * https://www.tradingview.com/widget-docs/widgets/charts/symbol-overview/demos/vertical-chart/
 * https://www.tradingview.com/widget-docs/tutorials/build-page/widget-integration/
 * Symbols validated in TradingView's official picker; these are Capital.com CFDs,
 * NOT the COMEX/CBOT/ICE/LME futures previously suggested as possible references.
 */
export const TRADINGVIEW_INSTRUMENTS = {
  COPPER: { symbol: "CAPITALCOM:XCUUSD", nameEn: "Copper", nameFr: "Cuivre" },
  ALU: { symbol: "CAPITALCOM:ALUMINUM", nameEn: "Aluminium", nameFr: "Aluminium" },
  WHEAT: { symbol: "CAPITALCOM:WHEAT", nameEn: "Wheat", nameFr: "Blé" },
  CORN: { symbol: "CAPITALCOM:CORN", nameEn: "Corn", nameFr: "Maïs" },
  COCOA: { symbol: "CAPITALCOM:COCOA", nameEn: "US Cocoa", nameFr: "Cacao US" },
} as const;

export type TradingViewCommodity = keyof typeof TRADINGVIEW_INSTRUMENTS;
export type WidgetLanguage = "en" | "fr";
export type WidgetKind = "symbol-overview" | "ticker-tape";

export function isTradingViewCommodity(symbol: string): symbol is TradingViewCommodity {
  return Object.prototype.hasOwnProperty.call(TRADINGVIEW_INSTRUMENTS, symbol);
}

export function tradingViewUrl(commodity: TradingViewCommodity) {
  const [provider, symbol] = TRADINGVIEW_INSTRUMENTS[commodity].symbol.split(":");
  return `https://www.tradingview.com/symbols/${provider}-${symbol}/`;
}

export function overviewConfig(commodity: TradingViewCommodity, lang: WidgetLanguage) {
  const instrument = TRADINGVIEW_INSTRUMENTS[commodity];
  return {
    symbols: [[lang === "fr" ? instrument.nameFr : instrument.nameEn, `${instrument.symbol}|1D`]],
    chartOnly: false,
    width: "100%",
    height: "320",
    locale: lang,
    colorTheme: "dark",
    autosize: false,
    showVolume: false,
    showMA: false,
    hideDateRanges: true,
    hideMarketStatus: false,
    hideSymbolLogo: false,
    scalePosition: "right",
    scaleMode: "Normal",
    noTimeScale: true,
    valuesTracking: "1",
    changeMode: "price-and-percent",
    chartType: "area",
    lineWidth: 2,
    dateRanges: ["1d|5"],
  };
}

export function tickerConfig(lang: WidgetLanguage) {
  return {
    symbols: Object.values(TRADINGVIEW_INSTRUMENTS).map((instrument) => ({
      proName: instrument.symbol,
      description: `${lang === "fr" ? instrument.nameFr : instrument.nameEn} · CFD`,
    })),
    showSymbolLogo: true,
    colorTheme: "dark",
    isTransparent: false,
    displayMode: "adaptive",
    locale: lang,
  };
}

export const WIDGET_COPY = {
  en: {
    status: "CFDs · Capital.com · latest available quotes, potentially delayed",
    native: "Native provider quotation, displayed by TradingView. No unit conversion.",
    blocked: "TradingView could not be loaded.",
    fallback: "Widget unavailable or blocked? View on TradingView",
    ticker: "Copper, aluminium, wheat, corn and cocoa · CFDs by Capital.com",
  },
  fr: {
    status: "CFD · Capital.com · dernières cotations disponibles, délai possible",
    native: "Cotation native du fournisseur, affichée par TradingView. Aucune conversion d’unité.",
    blocked: "TradingView n’a pas pu être chargé.",
    fallback: "Widget indisponible ou bloqué ? Consulter sur TradingView",
    ticker: "Cuivre, aluminium, blé, maïs et cacao · CFD de Capital.com",
  },
} as const;

/** One isolated subtree per effect. Removing it cannot remove a newer mount.
 * This uses only the documented script + JSON integration, not an iframe/data API.
 * Never inspect a hosted widget's DOM, responses, prices or messages.
 */
export function mountTradingViewWidget(
  host: HTMLElement,
  kind: WidgetKind,
  config: object,
  sourceUrl: string,
  attribution: string,
  onError: () => void,
) {
  const doc = host.ownerDocument;
  const container = doc.createElement("div");
  container.className = "tradingview-widget-container";
  container.style.width = "100%";
  const widget = doc.createElement("div");
  widget.className = "tradingview-widget-container__widget";
  const copyright = doc.createElement("div");
  copyright.className = "tradingview-widget-copyright";
  const link = doc.createElement("a");
  link.href = sourceUrl;
  link.rel = "noopener noreferrer nofollow";
  link.target = "_blank";
  const label = doc.createElement("span");
  label.className = "blue-text";
  label.textContent = attribution;
  link.append(label);
  const trademark = doc.createElement("span");
  trademark.className = "trademark";
  trademark.textContent = " by TradingView";
  copyright.append(link, trademark);
  container.append(widget, copyright);

  const script = doc.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.src = `https://s3.tradingview.com/external-embedding/embed-widget-${kind}.js`;
  script.textContent = JSON.stringify(config);
  let active = true;
  script.onerror = () => {
    if (active) onError();
  };
  container.append(script);
  host.replaceChildren(container);
  return () => {
    active = false;
    script.onerror = null;
    container.remove();
  };
}
