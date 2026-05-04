# WinGroX Digital Twin — Complete Technical Solution

**Owner:** Shivani · WinGroX AI
**Last updated:** 4 May 2026
**Version:** v3 (Twin Engine + Guided Conversation Chatbot + Backend API)

---

## What's in this bundle

```
tech-solution/
├── TECH_SOLUTION.md              ← This file (master overview)
├── DEPLOYMENT_RUNBOOK.md         ← Step-by-step prod deployment
├── ARCHITECTURE.html             ← Visual system architecture diagram
├── wingrox-os.html               ← Complete frontend (2.3 MB, single file)
└── wingrox-backend.zip           ← Backend API source (28 KB)
```

---

## 1 · Solution Overview

WinGroX Digital Twin is a single-page consulting-grade business diagnostic platform with two entry modes:

**Mode A · Quantitative Path** — A 100-question diagnostic across 17 modules and 4 strategic engines, producing a master score, layer breakdowns, top bottlenecks, scenario simulator, 5-year projections, valuation estimate, As-Is to To-Be transformation map, prioritised roadmap, and a 32-slide investor-grade PowerPoint deck.

**Mode B · Conversational Path** — An AI advisor chatbot that walks the user through 13 simple sections (~45 questions), captures confidence levels and document uploads, then hands off to the WinGroX human team for review and report generation.

Both modes share the same data model, backend, and lead-capture infrastructure.

---

## 2 · Frontend (wingrox-os.html)

**Single self-contained HTML file** — no build step, no bundler, no framework. Drop on any static host and it works.

### What it contains
- Hero, navigation, and shell layout
- **Digital Twin V3** with 7 stages (Choose Tier → Profile → Diagnose → Report → Simulator → Predict → Deck)
- **3-Tier paywall** (Nucleus Free / Vanguard $199 / Apex Book Call)
- **Context Shape Engine** profile capture with chips, file uploads, and 12 actual financial overrides
- **1-question-per-page diagnostic** with module gating (cannot skip ahead within a module)
- **Motivation cards** between modules
- **Comprehensive 8-section report** (Exec Summary, Revenue Engine, Funnel, Cost & Profit, Constraints, deep dives for all 17 modules with root causes, 5-year projections + valuation, As-Is to To-Be, Insights & Roadmap)
- **Scenario simulator** with 9 levers
- **32-slide PPTX export** built with PptxGenJS
- **Guided Conversation Chatbot** (13 sections, conversational flow, confidence layer, document uploads, smart follow-ups, mini-checkpoints, thank-you closing)
- **Probing CTAs** throughout (Email Advisor + Book Strategy Call)

### Tech stack
- HTML5, CSS3 (custom design system, no framework)
- Vanilla JavaScript (no React/Vue)
- PptxGenJS (lazy-loaded from CDN when user clicks "Download PPTX")
- Playfair Display + Outfit + JetBrains Mono fonts (Google Fonts)

### Design system
- Cream `#F5F2EB` / Gold `#C9973A` / Deep Ink `#1A1814`
- Italic Playfair display headlines
- McKinsey-grade typography
- Light theme throughout

### File size
2.3 MB — large because everything is bundled (CSS, JS, question data, scoring engine, narrative content). Acceptable for a serious diagnostic tool but you'll want to split this for high-traffic deployments.

---

## 3 · Backend (wingrox-backend.zip)

**Production-ready Node.js + Express + Postgres + Prisma + Stripe** backend that adds:

### Capabilities
1. **Authentication** — Email + password signup/login, JWT-based sessions, bcrypt password hashing (cost factor 12)
2. **Diagnostic persistence** — Save and resume sessions across devices, store profile + answers + final results
3. **File uploads** — Multipart uploads with type allowlist (PDF/PPTX/DOCX/XLSX), 20MB cap, local disk for dev with S3-ready hooks
4. **Lead capture** — Replaces every `mailto:` advisor CTA with a database record + Slack webhook ping
5. **Stripe payments** — $199 Vanguard checkout with webhook signature verification that auto-upgrades user tier on payment success

### Endpoints (14 total)

```
Auth:
  POST   /api/auth/signup          → {email, password, name?} → {user, token}
  POST   /api/auth/login           → {email, password} → {user, token}
  GET    /api/auth/me              → auth required → {user}

Sessions (diagnostic CRUD):
  POST   /api/sessions             → {tier, profile?} → {session}
  GET    /api/sessions             → list user's sessions
  GET    /api/sessions/:id         → full session detail
  PATCH  /api/sessions/:id         → {profile?, answers?} (debounced auto-save)
  POST   /api/sessions/:id/complete → {results} (finalize)
  DELETE /api/sessions/:id         → soft-delete

Files:
  POST   /api/files                → multipart upload, 20MB cap
  GET    /api/files                → list (optional ?sessionId=)
  DELETE /api/files/:id            → remove

Leads (advisor CTAs + chatbot submissions):
  POST   /api/leads                → {context, email, name?, mobile?, message?, sessionId?, masterScore?, tier?}
  GET    /api/leads                → admin/owner only

Payments:
  POST   /api/payments/checkout    → {tier, successUrl, cancelUrl} → {url}
  GET    /api/payments             → user's payment history
  POST   /api/webhooks/stripe      → Stripe webhook (signature-verified)
```

### Database schema (5 tables)

```
users               id, email, passwordHash, name, tier, stripeCustomerId, timestamps
diagnostic_sessions id, userId, tier, profile (jsonb), answers (jsonb),
                    results (jsonb), status, completedAt, timestamps
uploaded_files      id, userId, sessionId, filename, mimeType, sizeBytes,
                    storageKey, storageDriver, createdAt
advisor_leads       id, userId, sessionId, context, email, name, mobile,
                    message, masterScore, tier, status, timestamps
payments            id, userId, stripePaymentIntentId, stripeSessionId,
                    amountCents, currency, tier, status, timestamps
```

The `profile` and `answers` columns are JSON because the schema there is already structured by your question IDs — no need to normalize those.

### Tech stack
- Node.js 18+ with ESM (`type: "module"`)
- Express 4 (mature, simple, good ecosystem)
- Prisma 5 (type-safe Postgres ORM)
- Postgres 16 (works locally via Docker, or via Supabase/Neon free tier)
- Stripe 17 (with webhook signature verification)
- Zod (request validation)
- Multer (multipart file uploads)
- JsonWebToken + bcrypt (auth)
- Helmet + express-rate-limit (security)

### Frontend integration adapter

Inside the backend bundle is `public/wingrox-api-adapter.js` — a drop-in script that connects your existing `wingrox-os.html` to the backend with **two extra lines**:

```html
<script>window.WINGROX_API_BASE = 'https://api.wingrox.ai/api';</script>
<script src="wingrox-api-adapter.js"></script>
```

The adapter monkey-patches your existing engine functions to add persistence without changing UI code. It wraps `dtAnswer1Q`, `dtSaveProfile`, `dtBeginDiagnostic`, `dtFinishDiagnostic`, `dtAdvisorEmail`, and `dtFilesUploaded` so every answer click debounces a save, every advisor CTA submits a lead, every file upload actually uploads, and pages can resume mid-diagnostic.

---

## 4 · Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  USER BROWSER                                                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  wingrox-os.html  (single file, 2.3 MB)                 ││
│  │  ┌─────────────────┐    ┌─────────────────────┐         ││
│  │  │ Quant Diagnostic│    │ Guided Chatbot      │         ││
│  │  │ 100 Qs / 17 mods│    │ 13 sections / 45 Qs │         ││
│  │  └────────┬────────┘    └─────────┬───────────┘         ││
│  │           │                       │                      ││
│  │           └───────────┬───────────┘                      ││
│  │                       │                                  ││
│  │           ┌───────────▼─────────────┐                   ││
│  │           │ wingrox-api-adapter.js  │                   ││
│  │           │ (auth, save, upload)    │                   ││
│  │           └───────────┬─────────────┘                   ││
│  └───────────────────────┼─────────────────────────────────┘│
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTPS · JSON · JWT bearer token
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  EXPRESS API                                                 │
│  ┌──────┐ ┌────────┐ ┌────────┐ ┌──────┐ ┌────────┐         │
│  │ Auth │ │Sessions│ │ Files  │ │Leads │ │Payments│         │
│  └──┬───┘ └───┬────┘ └───┬────┘ └──┬───┘ └────┬───┘         │
│     │        │           │         │          │              │
│     ▼        ▼           ▼         ▼          ▼              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Middleware: helmet, cors, rate-limit, JWT verify   │    │
│  └─────────────────────────────────────────────────────┘    │
│     │        │           │         │          │              │
└─────┼────────┼───────────┼─────────┼──────────┼──────────────┘
      │        │           │         │          │
      ▼        ▼           ▼         ▼          ▼
   ┌──────────────────┐  ┌────┐  ┌──────┐  ┌────────┐
   │  POSTGRES        │  │ S3 │  │Slack │  │ STRIPE │
   │  (Supabase/Neon) │  │ /  │  │ web- │  │        │
   │                  │  │disk│  │ hook │  │        │
   │ users            │  └────┘  └──────┘  └────────┘
   │ diagnostic_sess. │
   │ uploaded_files   │
   │ advisor_leads    │
   │ payments         │
   └──────────────────┘
```

---

## 5 · Data Flow Examples

### When a user answers a diagnostic question

1. User clicks an option in `wingrox-os.html`
2. `dtAnswer1Q(qId, optIdx)` updates `DT_STATE.answers[qId]` (instant UI feedback)
3. Auto-advance to next question after 250ms (instant UI)
4. Adapter wraps the function and calls `wingroxSession.queueSave({answers: {[qId]: optIdx}})`
5. After 800ms of inactivity, the queued saves are flushed in one batched `PATCH /api/sessions/:id`
6. Backend writes to Postgres `diagnostic_sessions.answers` JSON column
7. If user closes the tab and returns later, hydration on page load restores their state

### When a user clicks "Book Strategy Call" CTA

1. User clicks the gold button in any report section
2. `dtBookCall('revenue-engine')` fires
3. If user is logged in: adapter calls `wingroxLeads.submit('revenue-engine')` which posts to `/api/leads` with master score, tier, profile context
4. Backend creates an `advisor_leads` record and pings Slack webhook
5. User sees "Advisor notified — they will reach out shortly" toast
6. If user is NOT logged in: falls back to `mailto:` link (graceful degradation)

### When a user completes the guided chatbot

1. User answers all 13 sections, ~45 questions, with confidence flags and optional uploads
2. On thank-you screen, the chatbot's `gcSubmit()` runs
3. Posts to `/api/leads` with `context: 'guided-conversation'` and a serialized message containing all responses + confidence + upload metadata
4. Backend stores the lead with status `NEW`
5. Slack pings your team
6. WinGroX human team reviews and produces the Digital Twin Intelligence Report

---

## 6 · Why This Architecture

### Why a single-file frontend?
- Faster iteration — no build step, edit and reload
- Easier to host — drop on any static host (Netlify, Vercel, S3, even Google Drive)
- No framework lock-in — every line is yours
- Works offline once loaded
- Trade-off: 2.3 MB initial download. Acceptable for a serious B2B tool, but for high-traffic consumer use you'd split it

### Why Postgres + Prisma over MongoDB?
- The data is relational (users have sessions, sessions have files and leads)
- Prisma gives you type safety without writing types manually
- JSON columns let you store flexible question/answer shapes without rigid schemas
- Postgres has free hosted tiers (Supabase, Neon) that include backups and SSL by default

### Why JWT over sessions/cookies?
- Stateless — works across multiple backend instances without shared session store
- Mobile-friendly if you ever build a mobile app
- Trade-off: localStorage tokens are XSS-vulnerable; for max security you'd switch to httpOnly cookies

### Why Stripe Checkout over inline payment forms?
- PCI compliance handled by Stripe (you never touch card numbers)
- Built-in 3DS, fraud detection, receipt emails
- One API call to create checkout, one webhook to confirm

### Why monkey-patching for the frontend adapter?
- Doesn't touch any of the existing UI code
- Backend persistence becomes additive, not invasive
- If the backend is unreachable, the UI continues to work (degraded mode)
- One file to add, one config line — minimum integration friction

---

## 7 · Security & Compliance Status

### What's already in place
- ✅ Bcrypt password hashing (cost factor 12)
- ✅ JWT tokens with configurable expiry (default 30d)
- ✅ Rate limiting (10/15min for auth, 200/15min for API)
- ✅ Helmet security headers (CSP, HSTS, X-Frame-Options, etc.)
- ✅ Zod validation on every request body
- ✅ SQL injection protection via Prisma parameterized queries
- ✅ Multer file type allowlist + size cap
- ✅ Stripe webhook signature verification
- ✅ CORS allowlist via `FRONTEND_URL`
- ✅ Production stack-trace suppression

### What you'll want to add before scale
- ⚠️ Email verification on signup
- ⚠️ Password reset flow
- ⚠️ User data export endpoint (GDPR / India DPDPA compliance)
- ⚠️ Audit log table for sensitive actions (financial overrides, profile changes)
- ⚠️ 2FA (TOTP via authenticator app)
- ⚠️ Encryption at rest for `actualMRR` / `actualCAC` etc. (Postgres `pgcrypto`)
- ⚠️ Privacy policy + cookie banner (legally required if you take Indian or EU users)

### Compliance notes for India
You're collecting business financials, mobile numbers, and uploaded pitch decks. Under the **Digital Personal Data Protection Act 2023** you need:
- Explicit consent before collection (add a checkbox at signup)
- A documented privacy policy
- A way for users to request deletion of their data
- A grievance officer email listed publicly

For EU users (if you target Europe) you also need GDPR data export and right-to-be-forgotten endpoints.

---

## 8 · Deployment Path

See `DEPLOYMENT_RUNBOOK.md` for step-by-step instructions. Quick summary:

### Recommended stack (~$10/month)
- **Frontend** — Vercel or Netlify (free tier)
- **Backend** — Railway ($5/month, includes Postgres add-on)
- **Database** — Railway Postgres OR Supabase free tier (500 MB free, then $25/month)
- **File storage** — Cloudflare R2 (10 GB free, then $0.015/GB/month) OR AWS S3
- **Email/notifications** — Slack webhook (free) for leads, Resend ($0/month for first 3000 emails) for transactional
- **Stripe** — 2.9% + ₹3/transaction (no monthly fee)
- **Domain** — ~$15/year for `.ai` domain

### Total monthly cost estimate
- 0–500 users: **$5–10/month** (Railway + free tier everything else)
- 500–5,000 users: **$25–50/month** (add Supabase paid + R2 storage)
- 5,000+ users: **$100+/month** (consider managed scaling, CDN, monitoring)

---

## 9 · Roadmap & Phasing

### Phase 1 · Beta launch (Week 1–2) — **Ship the MVP**
- Deploy frontend to Vercel
- Deploy backend to Railway with Postgres add-on
- Wire frontend adapter
- Configure Slack webhook for leads
- Skip Stripe initially — give Vanguard free during beta to a curated 20–50 user list
- Gather feedback on diagnostic questions, motivation copy, report sections

### Phase 2 · Monetize (Week 3) — **Add payments**
- Set up Stripe account, create $199 Vanguard product
- Configure webhook signing secret
- Test in Stripe test mode end-to-end
- Switch to live mode
- Add a payment-success page

### Phase 3 · Scale prep (Week 4+) — **Production readiness**
- Move file storage to R2/S3
- Set up monitoring (Logtail, Sentry, or Highlight)
- Email transactional flows (signup welcome, payment receipt) via Resend
- Email verification flow
- Password reset flow
- Build admin dashboard for advisors to triage leads
- Add per-user data export endpoint

### Phase 4 · Conversion optimization
- A/B test entry points (tier card vs guided chatbot first)
- A/B test pricing ($149 vs $199 vs $249)
- Add post-diagnostic email sequence (Day 1: report summary, Day 7: book call reminder, Day 30: re-run diagnostic prompt)
- Build "share results" feature for viral loop

### Phase 5 · Apex tier productization
- Add admin-side tooling to deliver Apex engagements
- White-glove onboarding flow
- Custom report generation pipeline (probably Python + python-pptx server-side)
- Recurring 90-day re-diagnostic packages

---

## 10 · Critical Decisions You'll Need to Make

| Decision | Options | Recommendation |
|---|---|---|
| Database host | Railway / Supabase / Neon | **Supabase** — free tier is generous, includes auth/storage/realtime if you ever need it |
| File storage | Local disk / S3 / R2 | **Cloudflare R2** — S3-compatible, no egress fees, 10 GB free |
| Lead notifications | Slack / Email / CRM | **Slack now, HubSpot later** — Slack is instant, CRM matters once you have a sales team |
| Domain | wingrox.ai / wingrox.com | **wingrox.ai** — already on-brand |
| Payment processor | Stripe / Razorpay | **Stripe for $USD, Razorpay for ₹INR** — most Indian SaaS supports both |
| Apex price | $999 / $2,499 / $5,000 | **Don't list a price** — book-a-call is correct, price varies by company size |
| Vanguard price | $99 / $199 / $299 | **$199** — the sweet spot, anchored against $5K consulting engagements |

---

## 11 · What's NOT Included (Yet)

These are deliberate omissions, not oversights:

- **Admin dashboard** — Advisors will check leads via Slack initially; build dashboard once volume justifies it
- **Email verification** — Adds signup friction; defer until you have payment fraud
- **Password reset** — 5 users for 1 month don't need this; add when you have 100+ users
- **Mobile app** — The HTML is responsive; native app is a Phase 5+ decision
- **Multi-tenant / team accounts** — One user per account; team mode is a separate product
- **i18n** — English only initially; add Hindi/regional only if user research shows demand
- **Embed/widget version** — Other sites can't embed your diagnostic; consider this for partner deals
- **Public sharing of results** — User can't share their report URL; consider this for virality
- **API access for paying users** — Programmatic access could be an Apex perk

---

## 12 · Getting Help

- **Frontend bugs / changes** — Edit `wingrox-os.html` directly. Test in browser. No build step.
- **Backend bugs / changes** — Edit files in `wingrox-backend/src/`. Run `npm run dev` to hot-reload.
- **Database changes** — Edit `wingrox-backend/prisma/schema.prisma`, run `npm run db:push`
- **Adding a new advisor CTA** — Just add `dtBookCall('your-section-id')` to the HTML; the backend already handles any context string
- **Adding a new tier** — Add to `Tier` enum in schema, update tier ranking in `sessions.js`, add UI in HTML

---

## 13 · Final Thoughts

What you have here is the equivalent of what an early-stage funded startup would build with a team of 3 over 4–6 weeks. The architecture choices are deliberately conservative — Postgres over MongoDB, Express over Fastify, JWT over OAuth, single-file HTML over React — because conservative choices age well. You'll be able to maintain and extend this for years without rewriting.

The trickiest part of going live isn't technical — it's the consent and privacy paperwork (DPDPA in India, GDPR if you target Europe). Get that done in parallel with technical deployment.

The second trickiest part is positioning. The product gives users a master score, top constraints, a roadmap, and an investor-grade deck — the language you wrap around it ("Digital Twin Intelligence" vs "Growth Diagnostic" vs "Strategic Health Check") will determine whether founders see it as a $199 fee or a $199 investment. Lean into the consulting framing.

Ship.
