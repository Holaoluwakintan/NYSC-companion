# NYSC Companion

Free, offline-first PWA for Nigerian corps members. Live: https://nysc-companion-ng.vercel.app
Not affiliated with the NYSC.

## Features
Countdown to the 2026 Batch C Stream II camp (Nov 4, 2026) · camp checklist with check-off, custom items and WhatsApp share ·
all 37 orientation camps (official NYSC addresses + official map pins, sourced notes, verified/unverified badges) ·
batch/stream timeline (2026) + personal service-year timeline · allowance (₦77,000, sourced) + budget tracker ·
PPA tips · SAED skills guide · FAQ/myth busters · CDS planner (day, group, attendance) · monthly clearance tracker ·
reminders via .ics / Google Calendar + in-app nudges · "Ask Corper Guide" AI (Gemini via /api/ask, rate-limited) ·
"My Camp" card (share link with per-state OG preview, or share as PNG) · optional Google sign-in + sync (Supabase) ·
dark mode, skeletons, reduced-motion, install prompt · ad slot + Premium teaser (OFF).

## Layout
- app/ : Vite + Preact + TypeScript. `npm install && npm run build` -> app/dist (postbuild writes sw.js precache).
  - src/data/facts.ts (dates, allowance, sources), src/data/content.ts (checklist, guides, FAQ), public/data/camps.json (37 camps)
  - src/lib/*.js pure logic (dates, sync merge, auth) with tests in app/test (`npm test`, node:test)
  - scripts/serve.mjs: local Vercel stand-in (static + /api + /c rewrite)
- api/ : Vercel functions (CommonJS): ask.js (Gemini, models gemini-3.6-flash -> gemini-flash-lite-latest),
  auth-status.js (is Google sign-in usable yet?), card.js (/c/:code share page with OG tags)
- vercel.json : /c/:code rewrite + headers
- deploy.py : REST deploy (no CLI). Env: VERCEL_TOKEN, VERCEL_TEAM, VERCEL_PROJECT.

## Server env (Vercel project settings)
GEMINI_API_KEY, SUPABASE_SECRET_KEY, AI_SALT. Optional: AI_PER_DAY (20), AI_GLOBAL_DAY (1500), GEMINI_MODELS.

## Data
Supabase project rlbrhpjljjgpqpqjrpkc, schema `nysc` (not exposed): state(user_id, data jsonb) owner-only RLS;
ai_usage(k, day, n) for rate limits. RPCs: nysc_get_state, nysc_put_state, nysc_delete_my_data (authenticated),
nysc_ai_hit (service_role only).

## Updating facts
Dates/allowance: src/data/facts.ts (each fact has sources + verified flag). Camps: public/data/camps.json
(source: https://www.nysc.gov.ng/camps.html, checked 2026-10-07). Next camp: NEXT_CAMP in facts.ts.

## Monetisation (OFF)
src/config.ts FLAGS.ads / FLAGS.premium. AdSlot renders nothing while ads=false; Premium shows "Coming soon".
