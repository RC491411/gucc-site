# GUCC website (Geneva University Commodities Club)

Recovered on 2026-10-30 from the Grok live preview of conversation bffcaaa4 (Vite dev server, raw sources fetched module by module) — identical to the last state in Grok.

Stack: Vite 8 + React 19 + TanStack Start/Router (file routes in `src/routes`) + Tailwind v4.

- `npm install`
- `npm run dev` → http://localhost:8080
- `npm run build` / `npm run preview`

Content (EN/FR texts, founders, missions, statuts) lives mostly in `src/lib/content.ts`; pages in `src/components/site/`.
Assets in `public/` (logo `mark.svg`, `logo.png` original raster, `hero/*.jpg`, `founders/*.jpg`, `founders-group.jpg`).

`.grok-original/` keeps Grok's sandbox-only `vite.config.ts`, `package.json` and `scripts/` (PWA, auth popup, PGlite, preview bridge) for reference; they are not used here.
Removed vs. Grok sandbox: PreviewHostBridge, `/__grok` manifest/icon links, nitro/vercel build preset, unused deps.

## Contact form

The EN/FR contact form uses Web3Forms and the verified recipient
`gucc.geneva@gmail.com`. `src/lib/contact-submit.ts` contains the **public embed
access key**, not a private account token. Never put account/session credentials
in this file. The visitor's `email` is Web3Forms' default Reply-To; programme,
request and language remain custom fields.

Each attempt makes exactly one JSON POST, with a 15-second deadline (including
reading the response). Only a 2xx response with boolean `success: true` clears the
form. Network errors, non-JSON responses, timeouts and gateway errors retain the
fields and explain that delivery is unknown; no automatic retry occurs. A local
honeypot discards bot attempts before any request.

Official integration references:
- https://docs.web3forms.com/how-to-guides/js-frameworks/react-js/react-js
- https://docs.web3forms.com/getting-started/customizations/custom-reply-to

Offline/mocked regression checks (no email sent):
- `npm run typecheck`
- `npm run test:contact` (Node 22.6+)
- `npm run build`
- `npx playwright install chromium`, then `npm run preview` in one terminal and
  `npm run test:contact:ui` in another. Every browser POST is intercepted locally.

These checks do not prove inbox receipt. A real end-to-end submission and mailbox
check must be explicitly approved before sending a test message.

## Market data

Only verified **previous completed trading-session closes** are eligible. Currently
no closing-price source/instrument is approved: all ten commodities show unavailable,
not static reference prices, intraday quotes or invented zero changes. No visible
date labels are added. See [the close policy/source audit](docs/market-close-policy.md)
for coverage, validation, units, calendars and refresh limitations.

`npm run test:markets` runs offline data-policy tests. After `npm run build`, run
`npm run test:markets:ui` for mocked EN/FR desktop/mobile renderer checks (Chromium
required). No real contact-form messages are sent by either command.
