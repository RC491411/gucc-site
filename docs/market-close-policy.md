# Previous completed trading session: fail-closed policy

## Coverage at deployment

**0/10 verified closing-price instruments. All ten display unavailable.**
BRENT, WTI, NATGAS, GOLD, SILVER, COPPER, ALU, WHEAT, CORN, COCOA.
No instrument/contract or current closing price is implied by a commodity name.
There are no fabricated fallback/reference prices, and no API account or subscription was opened.

This deliberately removes misleading prices; it does **not** claim to have delivered
an operational closing-price feed. A properly identified and licensed source still
needs to be approved before numbers can be shown. A session date cannot be reported
for any production quote because no production closing quote has been verified.

## Source review (7 November 2026, Europe/Zurich)

- https://docs.oilpriceapi.com/api-reference/prices/demo : the previously configured
  keyless demo documents **current spot** prices and **24-hour** changes; historical
  access is not included. The prior BRENT/WTI/NATGAS/GOLD/SILVER endpoint cannot certify
  either of the two required exchange-session closing prices. Removed entirely.
- https://www.cmegroup.com/market-data/settlements.html : CME describes daily
  **settlement** values. Settlement is not silently substituted for last-trade close.
  No reviewed public adapter with fixed-contract closes, exchange calendar and
  redistribution permission has been established for WTI, gas, gold, silver, wheat,
  corn or copper. Search results for CME SDR CSVs refer to swap reporting, not a
  validated futures daily-close source; they were not used.
- https://www.ice.com/report-center/data-subscription : the documented automated
  EOD report delivery uses subscription/Access ID/data agreements. No approval was
  given for that service. BRENT and COCOA therefore have no approved close adapter.
- https://www.lme.com/market-data/accessing-market-data/historical-data : LME describes
  next-day-delayed current-year data and historical reports. Public visibility is
  not treated as blanket redistribution permission. A precise copper/aluminium
  contract/prompt, closing-price dataset and approved public-use method remain
  unverified. No private endpoint was used.
- https://stooq.com/db/h/ : the public bulk-export page did not establish the exact
  commodity contract/roll, session-close semantics, exchange calendar and permitted
  public redistribution required for this site. It was not substituted blindly.

No claim is made that a suitable source does not exist. None was verified under the
current no-signup/no-purchase/no-private-API constraints. A third-party daily OHLC
file with ambiguous contract rolls or session dates is not sufficient proof.

## Validation contract

`src/lib/market-close-data.ts` is the single approval/validation boundary. Production
`APPROVED_INSTRUMENTS` is intentionally empty. The fetched JSON cannot approve its
own provider, instrument, unit conversion or calendar. The tests use clearly marked
synthetic fixtures only. Never copy their sample prices/calendars into production.

A reviewed adapter requires:

1. A documented source, public-display rights, exchange/market, spot versus futures
   identity, and for futures a fixed maturity/prompt code. No anonymous front-month
   roll or spot/futures substitution.
2. Currency, exact raw unit, exact display unit and explicit normalization factor.
   Gold/silver use troy ounces; grains' cents must not be mistaken for dollars;
   copper per pound must not be shown as per tonne without verified normalization.
3. An authoritative explicit session calendar (including holidays/early closes),
   its source and coverage interval, and the exchange timezone. No generic US stock
   calendar or Monday-to-Friday heuristic is used for commodity futures.
4. Final `kind: "session_close"` observations for the last calendar session **strictly
   before the exchange-local today**, with source publication at or after that
   session's close. Today's intraday price (or even today's completed close) is not
   eligible. Session date, source publication and snapshot timestamps stay internal;
   **no date labels are added to the website**, as requested.
5. For a percentage, the immediately preceding calendar session on the **same fixed
   instrument, source, currency and unit**. Percent = `(close / priorClose - 1) * 100`.
   A missing/invalid baseline leaves the close available but change null. Genuine
   zero is neutral `0.00%`; missing is not zero. Small nonzero moves are not rounded
   to a false `+0.00%`.

No provisional, stale-session, future, malformed, zero-placeholder or unapproved
prices are shown. Negative prices are conservatively unavailable pending an
instrument-specific approved policy (they are not silently changed to zero).
A comparison chart shows only two verified closes, not invented 16-point history.
The Brent/WTI spread requires matching session, currency and unit.

## Static Pages / refresh / failure behavior

`public/data/market-closes.v2.json` is an explicit empty, schema-versioned public
snapshot today. There is **no daily upstream refresh** to promise while no source is
approved. No workflow re-labels old quotes as a new day's close or fetches current
spot prices. A new source needs its documented adapter plus an appropriate snapshot
refresh workflow; credentials, if ever needed, belong server-side in Actions secrets,
never frontend source or this JSON.

The browser GETs that same-origin snapshot on load, every 15 minutes and when a tab
becomes visible; it revalidates the exchange-session requirement every minute.
Fetches have a 10-second deadline including JSON parsing, bypass HTTP cache, and fail
to unavailable. Local/session price caches are never used. The incompatible old
`gucc-live-quotes-v1` localStorage key is removed, not migrated. An expired calendar
or newly missing required session fails closed even in an already-open tab.

The deploy workflow runs typecheck, market regression tests, existing mocked contact
transport tests and the production build. No real form message is submitted.

## Tests

- `npm run test:markets`: all-ten unavailable, strict source/calendar/schema checks,
  weekend/holiday and timezone boundary selection, today's/future/stale/intraday/
  settlement rejection, publication timestamps, baseline gaps/rollover, missing versus
  true zero, currency/unit normalization, same-session spread, failed/timeout snapshot GET.
- `npm run build && npm run test:markets:ui`: starts its own local preview; intercepts
  all snapshot GETs, blocks external requests, seeds the legacy cache and tests empty,
  malformed, HTTP failure, network failure and unapproved payloads in EN/FR at mobile/
  desktop sizes across ticker, all desks, cards, charts and spread. No dates are shown.

These protections reduce identifiable errors; no system can guarantee that upstream
market data will never contain an error. Unknown data stays unavailable.
