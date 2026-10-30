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
