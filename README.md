# Pomodoro Odyssey

A gamified Pomodoro timer: focus sessions, ambient sounds, a daily
checklist, and an 800-item collection (8 categories x 100 items) unlocked
one random item per completed session, with certificates, statistics, and
sharing.

## Stack

React 18 + TypeScript + Vite, Tailwind CSS v4, Zustand (with localStorage
persistence), Framer Motion, React Router, dnd-kit, Recharts, canvas-confetti,
html2canvas-pro + jsPDF for certificate export.

## Running it

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check + production build
npm run lint        # oxlint
```

## What's real vs. mocked

Everything under **Timer, Ambient Sounds, Tasks, Collection/Gallery,
Statistics, Certificates, Settings** is fully functional against browser
`localStorage` — no backend required.

The spec this app was built from also describes a full backend (Postgres,
Redis, S3, real OAuth, AI image generation, WebSocket sync, leaderboards,
a React Native app). Building that requires infrastructure and credentials
this environment doesn't have, so those pieces are implemented as **mock
services with the same request/response shapes** described in the spec,
so they're a near drop-in swap for real endpoints later:

- `src/services/mockAuthApi.ts` — register/login/Google/magic-link, backed
  by a fake "accounts table" in localStorage.
- `src/services/aiImageService.ts` — `generateItemImage`,
  `getGenerationStatus`, `batchGenerateImages`, `regenerateItem`, matching
  the documented endpoint contracts (currently returns placeholder emoji
  illustrations instead of AI-generated art).
- `src/store/syncStore.ts` — simulated cloud sync status/progress; there's
  no server to sync with yet.
- `src/services/shareService.ts` — uses the real Web Share API / clipboard
  where possible; social "share to X/Discord/etc." links point at intent
  URLs but there's no public profile page to point them at yet.
- Leaderboard page mixes your real local stats with seeded fake peers.

Not built: the React Native mobile app, real OAuth/2FA, WebSocket
real-time sync, admin dashboards, and community/marketplace features.

## Known issues

- **Ambient sounds / chime are silent in Safari when running the local dev
  server (`http://localhost`).** Confirmed via a minimal, app-independent
  test snippet (bare `new AudioContext()` + oscillator, created directly
  inside a real click handler) that Safari itself keeps the `AudioContext`
  `suspended` and produces no sound on this origin, even with the
  Settings → Websites → Auto-Play permission set to allow. Chrome and
  Firefox both play audio correctly — this is a Safari + local-dev-origin
  interaction, not a bug in the app's audio code. Untried follow-ups if
  this needs to work in Safari later: test over HTTPS (e.g. via `vite
  --https` or a tunnel) instead of plain `http://localhost`, or test in a
  Safari Private Browsing window / via `127.0.0.1` instead of `localhost`.

## Data

The 800 collection items are generated once by
`src/scripts/generate-items.mjs` into `src/data/items.json` /
`levels.json` (curated real-world names per category, deterministic
seeded rarity distribution ~55/30/14/1%). Re-run it with
`node src/scripts/generate-items.mjs` if you tweak the source lists.
