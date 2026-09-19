# FLOWSTATE — Master Build Plan

> Single source of truth for building FLOWSTATE (AI-powered habit coach) from an empty folder to production.
> Client: React 19 + Vite | Server: Node + Express 5 + MongoDB/Mongoose | AI: Groq (primary) + Hugging Face (fallback)

---

## P0 — Setup & Tooling

**Dependencies:** none (first phase).

- [ ] [SETUP-01] **Initialize repo structure** — create `client/`, `server/` folders at project root with README placeholder | Files: `client/`, `server/` | Acceptance: both folders exist and are git-tracked | Est: S
- [ ] [SETUP-02] **Scaffold Vite React app** — create React 19 + Vite app inside `client/` (JS, not TS) | Files: `client/package.json`, `client/vite.config.js`, `client/index.html` | Acceptance: `npm create vite@latest` output present; `npm run dev` serves default page | Est: S
- [ ] [SETUP-03] **Install client dependencies** — react-router-dom@7, firebase, framer-motion, react-icons, axios | Files: `client/package.json` | Acceptance: `npm install` completes; all 5 deps in `dependencies` | Est: S
- [ ] [SETUP-04] **Configure ESLint for client** — lint script runs clean on scaffold | Files: `client/eslint.config.js`, `client/package.json` | Acceptance: `npm run lint` exits 0 | Est: S
- [ ] [SETUP-05] **Scaffold Express server** — `npm init`, install express@5, mongoose, dotenv, cors, cookie-parser, bcrypt, nodemailer, groq-sdk, @huggingface/inference | Files: `server/package.json` | Acceptance: all deps installed; `express` version is 5.x | Est: S
- [ ] [SETUP-06] **Add dev tooling for server** — nodemon as devDependency, `dev` and `start` scripts | Files: `server/package.json` | Acceptance: `npm run dev` starts server with auto-reload | Est: S
- [ ] [SETUP-07] **Create env file templates** — `.env.example` for server (PORT, MONGO_URI, GROQ_API_KEY, HF_TOKEN, CORS_ORIGIN, NODE_ENV) and client (`VITE_API_URL`, Firebase config keys) | Files: `server/.env.example`, `client/.env.example` | Acceptance: both files present; real `.env` files gitignored | Est: S
- [ ] [SETUP-08] **Configure gitignore** — ignore `node_modules`, `.env`, `dist/`, logs in both packages and root | Files: `.gitignore` | Acceptance: `git status` shows no `node_modules` or `.env` | Est: S
- [ ] [SETUP-09] **Add dev proxy / API base URL strategy** — axios instance reads `VITE_API_URL` | Files: `client/src/api/axios.js` | Acceptance: axios instance exports `baseURL` from env with localhost fallback | Est: S

---

## P1 — Server Core

**Dependencies:** P0 complete (server scaffolded, deps installed).

- [ ] [SRV-01] **Create server entry point** — `server/server.js` imports app, connects DB, listens on PORT | Files: `server/server.js` | Acceptance: `npm run dev` logs DB connect + port | Est: S
- [ ] [SRV-02] **Build Express app module** — `src/app.js` with JSON/urlencoded body parsing, cookie-parser, CORS (origin from env, credentials true) | Files: `server/src/app.js` | Acceptance: app exports configured express instance; CORS allows client origin | Est: S
- [ ] [SRV-03] **Implement DB connector** — `src/db.js` exports `connectDB()` using mongoose with `MONGO_URI`, logs host on success, exits on failure | Files: `server/src/db.js` | Acceptance: connects to MongoDB (Atlas or local); failure logs error and `process.exit(1)` | Est: S
- [ ] [SRV-04] **Add health check route** — `GET /` or `/health` returns `{ status: "ok" }` | Files: `server/src/app.js` | Acceptance: curl returns 200 JSON | Est: S
- [ ] [SRV-05] **Create users model** — `users.model.js` with mongoose schema: name, email (unique), googleId, photoURL, password (hashed, for non-Google users), chatHistory array (role, content, timestamp), timestamps | Files: `server/src/models/users.model.js` | Acceptance: model compiles; unique index on email created | Est: S
- [ ] [SRV-06] **Wire route mounting** — `/ai` and `/api/v1/users` routers mounted in `app.js` | Files: `server/src/app.js`, `server/src/routes/ai.routes.js`, `server/src/routes/users.routes.js` | Acceptance: 404 JSON for unknown paths; routers respond on their prefixes | Est: S
- [ ] [SRV-07] **Add global error handler + 404 handler** — consistent JSON error shape `{ message, status }` | Files: `server/src/app.js` (or `server/src/middleware/error.middleware.js`) | Acceptance: thrown errors return JSON, not HTML stack page | Est: S

---

## P2 — Auth

**Dependencies:** P1 complete (server core, users model). Client: SETUP-03 done (firebase installed).

- [ ] [AUTH-01] **Create Firebase project config module** — initialize Firebase app + auth from `VITE_` env vars | Files: `client/src/firebase/config.js` | Acceptance: `auth` export usable; no console errors on import | Est: S
- [ ] [AUTH-02] **Implement server Google-auth endpoint** — `POST /api/v1/users/google-auth` accepts `{ name, email, photoURL, uid }`, upserts user, returns user doc (no password leak) | Files: `server/src/controllers/users.controller.js`, `server/src/routes/users.routes.js` | Acceptance: first call creates user; repeat call returns same user; password field excluded | Est: M
- [ ] [AUTH-03] **Build client AuthContext** — context exposes `user`, `loading`, `signInWithGoogle`, `signOut`; subscribes to `onAuthStateChanged` | Files: `client/src/context/AuthContext.jsx` | Acceptance: user state persists across reload; loading true until first auth event | Est: M
- [ ] [AUTH-04] **Wire signInWithGoogle flow** — Google popup sign-in → sync profile to server endpoint → store user in context | Files: `client/src/context/AuthContext.jsx` | Acceptance: signing in creates/reads mongo user; avatar visible in UI | Est: M
- [ ] [AUTH-05] **Implement signOut** — Firebase signOut clears context + any cached profile | Files: `client/src/context/AuthContext.jsx` | Acceptance: after signOut user is null; protected routes inaccessible | Est: S
- [ ] [AUTH-06] **Create ProtectedRoute component** — redirects unauthenticated users to `/` from `/chat`; shows loader while auth resolving | Files: `client/src/components/ProtectedRoute.jsx` | Acceptance: `/chat` unreachable signed-out; no flash of chat content | Est: S
- [ ] [AUTH-07] **Gate `/chat` route in router** — wrap chat route with ProtectedRoute | Files: `client/src/App.jsx` (or `client/src/main.jsx`) | Acceptance: end-to-end gate verified in browser | Est: S

---

## P3 — AI Integration

**Dependencies:** P1 complete (server core, routes), P2 complete (chat needs authed user id).

- [ ] [AI-01] **Create AI provider service** — module exposes `generateCoachReply(messages)` using Groq SDK chat completions; system prompt defines FLOWSTATE habit-coach persona | Files: `server/src/services/ai.service.js` | Acceptance: returns string reply from Groq; throws structured error on failure | Est: M
- [ ] [AI-02] **Add Hugging Face fallback** — on Groq failure, retry with `@huggingface/inference` text generation; log provider switch | Files: `server/src/services/ai.service.js` | Acceptance: disabling Groq key still yields a reply via HF | Est: M
- [ ] [AI-03] **Implement suggestions endpoint** — `POST /ai/suggestions` returns 3–5 short habit suggestions for given context/mood | Files: `server/src/controllers/ai.controller.js`, `server/src/routes/ai.routes.js` | Acceptance: curl with `{ "context": "..." }` returns JSON array of suggestions | Est: M
- [ ] [AI-04] **Implement chat turn handler** — `POST /api/v1/users/chat` accepts `{ userId, message }`, appends user + assistant messages to `chatHistory`, returns assistant reply | Files: `server/src/controllers/users.controller.js` | Acceptance: two messages persisted per turn; reply returned in response | Est: M
- [ ] [AI-05] **Implement chat-history endpoint** — `GET /api/v1/users/chat-history?userId=` returns ordered history for the user | Files: `server/src/controllers/users.controller.js` | Acceptance: history matches prior chat turns in order | Est: S
- [ ] [AI-06] **Add AI error handling + timeouts** — provider calls wrapped with timeout; friendly fallback message when all providers fail | Files: `server/src/services/ai.service.js` | Acceptance: revoked keys → 200 with graceful message, no crash | Est: S

---

## P4 — Client Shell

**Dependencies:** P0 complete; AUTH-01 for config; designs informed by architecture spec.

- [ ] [SHELL-01] **Configure router with all routes** — react-router-dom v7 routes: `/` Landing, `/chat` (protected), `/smart-guidance`, `/priority-insights`, `/privacy` | Files: `client/src/App.jsx`, `client/src/main.jsx` | Acceptance: all 5 paths resolve; unknown path shows 404 or redirects home | Est: M
- [ ] [SHELL-02] **Create page shells** — placeholder page components for Landing, Chat, SmartGuidance, PriorityInsights, Privacy | Files: `client/src/pages/*.jsx` | Acceptance: each route renders its page name | Est: S
- [ ] [SHELL-03] **Build base layout primitives** — page container, section wrappers, shared button/link styles as CSS tokens | Files: `client/src/components/`, `client/src/index.css` | Acceptance: layout reused by all pages; no dead CSS | Est: S
- [ ] [SHELL-04] **Add axios API layer functions** — `sendChat`, `getChatHistory`, `getSuggestions`, `googleAuth` calling server endpoints | Files: `client/src/api/` | Acceptance: functions hit correct URLs; errors surfaced to caller | Est: S
- [ ] [SHELL-05] **Wire AuthProvider + ThemeProvider in root** — providers wrap RouterProvider/BrowserRouter | Files: `client/src/main.jsx` | Acceptance: contexts available in every page (verified via devtools or test render) | Est: S

---

## P5 — Landing Page

**Dependencies:** P4 complete (router, shells); P7 fonts/theme can land in parallel but Header/Hero use the CSS tokens.

- [ ] [LAND-01] **Build Header component** — fixed header, blur-on-scroll background, logo, nav links to all routes, mobile hamburger menu, auth-aware profile dropdown (avatar + sign out) | Files: `client/src/components/Header.jsx`, `client/src/styles/header.css` (or co-located CSS) | Acceptance: header sticky on all pages; scroll adds blur class; mobile menu opens/closes; dropdown shows only when signed in | Est: L
- [ ] [LAND-02] **Build Hero with decode animation** — headline scrambles/decodes into final text on mount; subcopy + CTA buttons to `/chat` | Files: `client/src/components/Hero.jsx` | Acceptance: text decodes once on load; CTA routes to chat | Est: M
- [ ] [LAND-03] **Respect reduced motion in Hero** — skip decode animation when `prefers-reduced-motion` matches | Files: `client/src/components/Hero.jsx` | Acceptance: with reduced-motion emulation, text renders instantly | Est: S
- [ ] [LAND-04] **Build BentoGrid section** — 5 feature cards in asymmetric bento layout (habit tracking, AI coach, future simulation, streaks/flow, privacy-first) with react-icons | Files: `client/src/components/BentoGrid.jsx` | Acceptance: 5 cards render in bento layout; responsive to mobile stack | Est: M
- [ ] [LAND-05] **Build Stats section** — animated counters/stat row | Files: `client/src/components/Stats.jsx` | Acceptance: numbers animate in on scroll into view | Est: S
- [ ] [LAND-06] **Build Gallery section** — visual showcase tiles with framer-motion reveal | Files: `client/src/components/Gallery.jsx` | Acceptance: tiles animate on scroll; layout responsive | Est: M
- [ ] [LAND-07] **Build Benefits section** — benefits list/two-column layout | Files: `client/src/components/Benefits.jsx` | Acceptance: content renders; responsive | Est: S
- [ ] [LAND-08] **Build FAQ section** — expandable Q&A accordions | Files: `client/src/components/FAQ.jsx` | Acceptance: each question toggles answer; keyboard accessible (button semantics) | Est: S
- [ ] [LAND-09] **Build ContactForm section** — name/email/message form with client validation and submit state | Files: `client/src/components/ContactForm.jsx` | Acceptance: invalid input shows errors; submit shows success/loading state | Est: M
- [ ] [LAND-10] **Assemble Landing page** — compose all sections in order: Header, Hero, BentoGrid, Stats, Gallery, Benefits, FAQ, ContactForm, Footer | Files: `client/src/pages/Landing.jsx` | Acceptance: full page scrolls cleanly; sections in specified order | Est: S

---

## P6 — App Pages

**Dependencies:** P4 complete; P2 (auth) for Chat; P3 (server AI endpoints) for Chat + SmartGuidance.

- [ ] [PAGE-01] **Build Chat page UI** — message list, composer input, send on Enter, auto-scroll to latest | Files: `client/src/pages/Chat.jsx`, chat subcomponents | Acceptance: local messages render instantly; layout stable | Est: M
- [ ] [PAGE-02] **Integrate chat API** — send via `POST /api/v1/users/chat`, show typing/loading state, render assistant replies | Files: `client/src/pages/Chat.jsx`, `client/src/api/` | Acceptance: full round-trip works end-to-end in browser | Est: M
- [ ] [PAGE-03] **Load chat history on mount** — fetch `GET /api/v1/users/chat-history` for signed-in user and render | Files: `client/src/pages/Chat.jsx` | Acceptance: history persists across reloads | Est: S
- [ ] [PAGE-04] **Build SmartGuidance page** — requests `POST /ai/suggestions`, renders suggestion cards with framer-motion entrance | Files: `client/src/pages/SmartGuidance.jsx` | Acceptance: suggestions render; loading + error states present | Est: M
- [ ] [PAGE-05] **Build PriorityInsights page** — priority/insight visualizations page | Files: `client/src/pages/PriorityInsights.jsx` | Acceptance: page renders its insight components responsively | Est: M
- [ ] [PAGE-06] **Build Privacy page** — static privacy policy content | Files: `client/src/pages/Privacy.jsx` | Acceptance: content renders; linked from footer/contact | Est: S
- [ ] [PAGE-07] **Handle empty/error/loading states app-wide** — consistent empty states for chat, suggestions, history failures | Files: `client/src/pages/`, `client/src/components/` | Acceptance: no blank screens on API failure | Est: S

---

## P7 — Theming & Fonts

**Dependencies:** P4 complete (index.css + root providers exist); benefits all pages built in P5/P6.

- [ ] [THEME-01] **Acquire Nothing fonts** — place `NType82-Headline`, `NType82`, `NType82Mono` webfont files in `client/public/fonts/` (see Risks: licensing) | Files: `client/public/fonts/` | Acceptance: font files present and referenced correctly | Est: S
- [ ] [THEME-02] **Declare @font-face + preload** — font-face rules with `font-display: swap`; `<link rel="preload" as="font" type="font/woff2" crossorigin>` in index.html | Files: `client/src/index.css`, `client/index.html` | Acceptance: fonts in network tab; no FOUT flash of fallback longer than swap window | Est: S
- [ ] [THEME-03] **Define CSS variable token system** — tokens for color, surface, text, border, accent across modes; typography scale mapping to Nothing fonts | Files: `client/src/index.css` | Acceptance: all components consume tokens (no hardcoded hex in components) | Est: M
- [ ] [THEME-04] **Implement mode switching (light/dark)** — `data-mode` on `<html>`; ThemeContext persists choice to localStorage; default from `prefers-color-scheme` | Files: `client/src/context/ThemeContext.jsx`, `client/src/index.css` | Acceptance: toggle instantly restyles app; preference survives reload | Est: M
- [ ] [THEME-05] **Implement theme variants (glass/neo/mono)** — `data-theme` attribute switches token sets; selector UI in Header or settings area | Files: `client/src/context/ThemeContext.jsx`, `client/src/index.css`, `client/src/components/Header.jsx` | Acceptance: 3 themes visually distinct; persisted to localStorage | Est: M
- [ ] [THEME-06] **Add no-flash inline script** — blocking inline script in `<head>` reads localStorage/system and sets `data-mode` + `data-theme` before paint | Files: `client/index.html` | Acceptance: no mode/theme flash on hard reload of a dark+neo session | Est: S
- [ ] [THEME-07] **Build grid background** — `body::before` grid overlay using token-driven colors, visible in all 6 mode×theme combos | Files: `client/src/index.css` | Acceptance: grid visible (not washed out / not overpowering) in every combination (manual matrix check) | Est: M
- [ ] [THEME-08] **Themed scrollbars + selection colors** — match token palette | Files: `client/src/index.css` | Acceptance: scrollbar/selection colors follow mode | Est: S

---

## P8 — Polish, A11y & QA

**Dependencies:** P1–P7 complete.

- [ ] [QA-01] **Framer-motion consistency pass** — uniform durations/easings across sections and pages | Files: `client/src/components/`, `client/src/pages/` | Acceptance: motion feels cohesive; no janky outliers | Est: M
- [ ] [QA-02] **Global `prefers-reduced-motion` audit** — all animations (not just Hero) disabled/reduced | Files: `client/src/` | Acceptance: emulated reduced motion → static render everywhere | Est: M
- [ ] [QA-03] **Accessibility pass** — semantic landmarks, focus styles, alt text, aria on menu/dropdown/accordion, color contrast ≥ WCAG AA in all 6 combos | Files: `client/src/` | Acceptance: axe/Lighthouse a11y ≥ 95; keyboard-only walkthrough of all routes | Est: M
- [ ] [QA-04] **Responsive QA matrix** — 360px / 768px / 1280px / 1920px on all 5 routes | Files: `client/src/` | Acceptance: no horizontal scroll, no overlap, mobile menu works at each breakpoint | Est: M
- [ ] [QA-05] **Cross-browser check** — Chrome, Edge, Firefox, Safari (fonts, grid, backdrop-blur) | Files: `client/` | Acceptance: visual parity; graceful blur fallback where unsupported | Est: S
- [ ] [QA-06] **Verify build & lint gates** — `npm run build` and `npm run lint` both exit 0 in client | Files: `client/` | Acceptance: clean output; dist/ generated | Est: S
- [ ] [QA-07] **Server smoke test script** — script or checklist hitting health, google-auth, chat, chat-history, suggestions | Files: `server/` | Acceptance: all endpoints return expected shapes against seeded dev DB | Est: S
- [ ] [QA-08] **Error boundary on client** — top-level React error boundary with friendly fallback and theme-consistent styling | Files: `client/src/components/ErrorBoundary.jsx`, `client/src/main.jsx` | Acceptance: throwing component shows fallback UI, not white screen | Est: S
- [ ] [QA-09] **Performance budget check** — Lighthouse performance ≥ 90 on `/`; fonts preloaded, images optimized, unused JS trimmed | Files: `client/` | Acceptance: report archived in repo or CI artifacts | Est: M

---

## P9 — Deployment

**Dependencies:** P8 complete (all QA gates green).

- [ ] [DEPLOY-01] **Prepare client production build** — env-based `VITE_API_URL` for prod API; verify `npm run build` output | Files: `client/.env.example`, `client/dist/` | Acceptance: build size sane; env not hardcoded | Est: S
- [ ] [DEPLOY-02] **Deploy server** — Node host (Render/Railway/Fly); set env vars; enable MongoDB Atlas IP allowlist; `start` script runs `node server.js` | Files: `server/package.json`, hosting config | Acceptance: deployed URL answers `/health` | Est: M
- [ ] [DEPLOY-03] **Deploy client** — static host (Vercel/Netlify); SPA fallback rewrite to `index.html`; set `VITE_` env vars | Files: hosting config (`vercel.json` / `netlify.toml`) | Acceptance: deep links like `/chat` load on refresh | Est: M
- [ ] [DEPLOY-04] **Lock CORS to production origin** — server CORS origin list includes only deployed client URL (+ localhost for dev) | Files: `server/src/app.js`, server env | Acceptance: browser from prod origin succeeds; other origins blocked | Est: S
- [ ] [DEPLOY-05] **Restrict Firebase authorized domains** — add production domain in Firebase console | Files: Firebase console (documented in `server/README` or runbook) | Acceptance: Google sign-in works on prod domain | Est: S
- [ ] [DEPLOY-06] **End-to-end production verification** — sign in → chat turn → reload → history persists → suggestions load → theme persists | Files: n/a (checklist) | Acceptance: full DoD flow passes on production URLs | Est: M
- [ ] [DEPLOY-07] **Write deployment runbook** — env var list, deploy steps, rollback notes in repo README | Files: `README.md` | Acceptance: a new dev can redeploy from doc alone | Est: S

---

## 🚦 Phase Progress

| Phase | Name | Done / Total | % |
|-------|------|--------------|---|
| P0 | Setup & Tooling | 0 / 9 | 0% |
| P1 | Server Core | 0 / 7 | 0% |
| P2 | Auth | 0 / 7 | 0% |
| P3 | AI Integration | 0 / 6 | 0% |
| P4 | Client Shell | 0 / 5 | 0% |
| P5 | Landing Page | 0 / 10 | 0% |
| P6 | App Pages | 0 / 7 | 0% |
| P7 | Theming & Fonts | 0 / 8 | 0% |
| P8 | Polish, A11y & QA | 0 / 9 | 0% |
| P9 | Deployment | 0 / 7 | 0% |
| **Total** | | **0 / 75** | **0%** |

> Update this table whenever a task checkbox is toggled. `% = done / total` rounded to whole numbers.

---

## ✅ Definition of Done

- [ ] `npm run build` exits 0 in `client/` and produces `dist/`.
- [ ] `npm run lint` exits 0 in `client/` (zero warnings as errors).
- [ ] Server starts with `npm run dev` and `npm start`, connects to MongoDB, and all five endpoints (suggestions, google-auth, chat, chat-history, health) respond correctly.
- [ ] Auth flow works end-to-end: Google sign-in → profile synced to Mongo → `/chat` accessible → sign-out → `/chat` blocked → redirect to `/`.
- [ ] Chat round-trip works: message sent → AI reply rendered → both persisted → history restored after reload.
- [ ] Light and dark modes both render correctly across every page.
- [ ] All three themes (glass, neo, mono) render distinctly in both modes (6 combos verified manually).
- [ ] Grid background visible in all 6 mode × theme combinations.
- [ ] Hero decode animation plays normally and renders static text when `prefers-reduced-motion` is set (app-wide reduced-motion audit passed).
- [ ] No mode/theme flash on reload (inline script verified).
- [ ] Lighthouse: performance ≥ 90 and accessibility ≥ 95 on `/`.
- [ ] CORS locked to known origins; prod sign-in authorized in Firebase; production E2E checklist passed.

---

## ⚠️ Risks & Notes

1. **Nothing font licensing** — NType82 / NType82-Headline / NType82Mono are proprietary typefaces by Nothing Technology. Self-hosting them publicly may require a license. Confirm redistribution rights before shipping to production; keep a fallback stack (`system-ui, sans-serif` / `ui-monospace, monospace`) wired so fonts can be swapped or removed without code changes.
2. **AI provider key management** — `GROQ_API_KEY` and `HF_TOKEN` must live only in server-side env, never in `VITE_` vars or client bundles. Add usage monitoring; Groq free-tier rate limits may force fallback to HF under load — verify fallback quality is acceptable.
3. **AI cost abuse** — `/ai/suggestions` and chat endpoints are open to abuse once the client URL is known. Require an authenticated user identifier for chat, and consider rate limiting before launch (track as future hardening; not in scope above).
4. **MongoDB connection handling** — use a single shared connection, fail fast on boot if DB is unreachable, and add Atlas IP allowlist entries for the server host. Index `email` (unique) and index `chatHistory` access patterns via `userId` lookups on the users collection.
5. **Chat history growth** — unbounded `chatHistory` arrays grow documents without limit. Note for later: cap or paginate history; current scope stores full history per spec.
6. **CORS origins** — never use `origin: "*"` with `credentials: true`. Maintain an explicit allowlist (localhost dev + deployed client) via env var; a mismatch here is the #1 expected prod-auth failure mode.
7. **Firebase authorized domains** — forgetting to add the production domain in Firebase console silently breaks Google sign-in on launch day. It's a console change, not code — keep it in the deploy checklist (DEPLOY-05).
8. **No-flash theming script** — the inline script in `index.html` must stay tiny, synchronous, and run before CSS paint; any refactor of index.html must preserve it (THEME-06).
9. **Express 5 differences** — Express 5 changed error handling for async routes (rejected promises auto-forward to error middleware) and path-to-regexp syntax; verify wildcard/404 routes use `/*splat` or middleware-style handlers, not Express 4 `*` patterns.

---

## 🚀 Stretch (post-launch, not in scope)

- [ ] **Code splitting** — route-based `React.lazy` + `Suspense` for `/chat`, `/smart-guidance`, `/priority-insights`; vendor chunk tuning in `vite.config.js`.
- [ ] **PWA** — manifest, service worker with offline shell, install prompt; cache landing assets and fonts.
- [ ] **Themes marketplace** — user-submitted themes; theme preview cards; community rating; import/export theme JSON.
