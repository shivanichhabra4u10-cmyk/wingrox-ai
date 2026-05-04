# WinGroX Backend API

Production-ready backend for the WinGroX Digital Twin diagnostic platform.

## What this gives you

- **Authentication** — Email/password signup, JWT-based sessions
- **Diagnostic persistence** — Save and resume sessions across devices
- **File uploads** — Pitch deck / docs storage (local for dev, S3-ready for prod)
- **Lead capture** — Replaces `mailto:` advisor CTAs with database records + Slack alerts
- **Stripe payments** — Vanguard $199 self-serve checkout with webhook tier upgrades
- **Postgres via Prisma** — Type-safe DB layer that works locally and on Supabase/Neon

## Project structure

```
wingrox-backend/
├── prisma/
│   └── schema.prisma          ← Database schema (5 tables)
├── src/
│   ├── index.js                ← Server entry point
│   ├── lib/
│   │   ├── prisma.js           ← Prisma client singleton
│   │   ├── auth.js             ← JWT + bcrypt helpers
│   │   └── validators.js       ← Zod request validators
│   ├── middleware/
│   │   ├── requireAuth.js      ← JWT verification middleware
│   │   └── errorHandler.js     ← Centralized error handling
│   └── routes/
│       ├── auth.js             ← /api/auth/* (signup, login, me)
│       ├── sessions.js         ← /api/sessions/* (diagnostic CRUD)
│       ├── files.js            ← /api/files/* (multipart uploads)
│       ├── leads.js            ← /api/leads/* (advisor lead capture)
│       ├── payments.js         ← /api/payments/* (Stripe checkout)
│       └── webhooks.js         ← /api/webhooks/stripe
├── public/
│   └── wingrox-api-adapter.js  ← Frontend adapter (drop into your HTML)
├── package.json
├── .env.example
└── README.md
```

## Quick start (local development)

### 1. Install dependencies

```bash
cd wingrox-backend
npm install
```

### 2. Set up the database

You have three options:

**Option A — Local Postgres (Docker)**
```bash
docker run --name wingrox-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=wingrox \
  -p 5432:5432 -d postgres:16
```

**Option B — Supabase (free, hosted)**
1. Go to https://supabase.com → New project
2. Project Settings → Database → Connection string → URI mode
3. Copy that to `DATABASE_URL`

**Option C — Neon (free, serverless Postgres)**
1. Go to https://neon.tech → New project
2. Copy the connection string to `DATABASE_URL`

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL and JWT_SECRET
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

### 4. Initialize database schema

```bash
npm run db:push      # creates tables in your database
npm run db:generate  # generates Prisma client types
```

### 5. Start the server

```bash
npm run dev
```

You should see:
```
✓ WinGroX API listening on http://localhost:4000
```

### 6. Verify it works

```bash
curl http://localhost:4000/api/health
# → {"status":"ok","timestamp":"..."}

# Sign up a test user
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'
# → {"user":{"id":"...","email":"test@example.com",...},"token":"eyJ..."}
```

## API reference

All routes are under `/api`. Authenticated routes require `Authorization: Bearer <token>` header.

### Auth
- `POST /api/auth/signup` — `{email, password, name?}` → `{user, token}`
- `POST /api/auth/login` — `{email, password}` → `{user, token}`
- `GET  /api/auth/me` — auth required → `{user}`

### Sessions
- `POST /api/sessions` — auth required — `{tier, profile?}` → `{session}`
- `GET  /api/sessions` — auth required → `{sessions[]}`
- `GET  /api/sessions/:id` — auth required → `{session}` (full detail)
- `PATCH /api/sessions/:id` — auth required — `{profile?, answers?}` → `{session}` (partial update)
- `POST /api/sessions/:id/complete` — auth required — `{results}` → `{session}`
- `DELETE /api/sessions/:id` — auth required → `{ok}`

### Files
- `POST /api/files` — auth required — multipart/form-data, field `files`, optional `sessionId` → `{files[]}`
- `GET  /api/files` — auth required, optional `?sessionId=xxx` → `{files[]}`
- `DELETE /api/files/:id` — auth required → `{ok}`

### Leads (advisor CTAs)
- `POST /api/leads` — auth optional — `{context, email, name?, mobile?, message?, sessionId?, masterScore?, tier?}` → `{ok, leadId}`
- `GET  /api/leads` — auth required (admin) → `{leads[]}`

### Payments
- `POST /api/payments/checkout` — auth required — `{tier, successUrl, cancelUrl}` → `{url}` (redirect there)
- `GET  /api/payments` — auth required → `{payments[]}`
- `POST /api/webhooks/stripe` — Stripe webhook (don't call directly)

## Frontend integration

You have two options for connecting your `wingrox-os.html` to this backend:

### Option 1: Drop-in adapter (easiest)

Copy `public/wingrox-api-adapter.js` next to your HTML. Add this script tag at the bottom of `<body>`, **after** all the existing scripts:

```html
<script>
  // Configure where your backend lives
  window.WINGROX_API_BASE = 'http://localhost:4000/api';
</script>
<script src="wingrox-api-adapter.js"></script>
```

The adapter automatically:
- Wraps `dtAnswer1Q` to persist each answer (debounced)
- Wraps `dtSaveProfile` to sync profile data
- Wraps `dtBeginDiagnostic` to create a backend session
- Wraps `dtFinishDiagnostic` to mark session completed with results
- Wraps `dtAdvisorEmail` to submit leads via API instead of mailto
- Wraps `dtFilesUploaded` to upload files to backend
- Hydrates DT_STATE on page load if user has an active session

You'll still need to add a login UI somewhere. The adapter exposes:
```javascript
await window.wingroxAuth.signup(email, password, name);
await window.wingroxAuth.login(email, password);
await window.wingroxAuth.me();          // → user or null
window.wingroxAuth.logout();
window.wingroxAuth.isLoggedIn();         // → boolean
```

### Option 2: Direct fetch calls (more control)

Skip the adapter and call the API directly from your existing functions. Example:

```javascript
async function dtAnswer1Q(qId, optIdx) {
  DT_STATE.answers[qId] = optIdx;
  // ... existing UI logic ...
  
  // Persist
  await fetch('http://localhost:4000/api/sessions/' + DT_STATE.sessionId, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
    body: JSON.stringify({ answers: { [qId]: optIdx } }),
  });
}
```

## Stripe payment setup

1. Create a Stripe account at https://stripe.com
2. Get test keys from https://dashboard.stripe.com/test/apikeys
3. Create a product:
   - Dashboard → Products → Add product
   - Name: "Vanguard — Full Intelligence"
   - Price: $199.00 USD, one-time
   - Copy the **Price ID** (starts with `price_`)
4. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_VANGUARD_PRICE_ID=price_xxx
   ```
5. Set up webhook (so payment success upgrades the user):
   - Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://your-domain.com/api/webhooks/stripe` (use ngrok for local: `ngrok http 4000`)
   - Events: `checkout.session.completed`, `payment_intent.payment_failed`
   - Copy the signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

For local webhook testing:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe   # mac
# Then forward events
stripe listen --forward-to localhost:4000/api/webhooks/stripe
```

## Deployment

### Railway (easiest, ~$5/mo)

1. Push code to GitHub
2. https://railway.app → New project → Deploy from GitHub
3. Add a Postgres database from Railway's add-ons (auto-injects `DATABASE_URL`)
4. Set environment variables (everything in `.env.example` except `DATABASE_URL`)
5. Railway auto-detects Node.js and runs `npm start`
6. Add a build command: `npm run db:generate && npm run db:push`

### Render (similar, free tier available)

1. https://render.com → New → Web Service
2. Connect GitHub repo
3. Build: `npm install && npm run db:generate && npm run db:push`
4. Start: `npm start`
5. Add a Postgres instance (free) and copy the `Internal Database URL`
6. Set env vars

### Fly.io (most control)

```bash
fly launch
fly postgres create
fly postgres attach <db-name>
fly secrets set JWT_SECRET=$(openssl rand -base64 32) STRIPE_SECRET_KEY=...
fly deploy
```

## Production checklist

Before going live:

- [ ] **JWT_SECRET** is at least 32 random chars (generate with `openssl rand -base64 32`)
- [ ] **DATABASE_URL** uses SSL in production (`?sslmode=require` for Neon/Supabase)
- [ ] **FRONTEND_URL** is set so CORS only allows your real frontend
- [ ] **NODE_ENV=production** disables stack trace leakage in errors
- [ ] **Stripe keys** are live (`sk_live_...`) not test (`sk_test_...`)
- [ ] **Stripe webhook** points at production URL with correct signing secret
- [ ] **UPLOAD_DRIVER=s3** with AWS credentials (don't store user uploads on the server disk in prod)
- [ ] **Rate limiting** is configured for your traffic (current limits: 10 auth/15min, 200 api/15min per IP)
- [ ] **Database backups** enabled (Supabase/Neon do this automatically; Railway/Render need configuration)
- [ ] **Logs** going somewhere (Logtail, Papertrail, or your hosting platform's log viewer)
- [ ] **Privacy policy** in place (you collect emails, financials, files — required for GDPR/India DPDPA)
- [ ] **Cookie/auth tokens** stored in httpOnly cookies if you want max security (current adapter uses localStorage which is fine for most cases but vulnerable to XSS)

## Common issues

**"Cannot find module '@prisma/client'"** — Run `npm run db:generate` after installing dependencies.

**"Database error: P1001"** — Your `DATABASE_URL` is wrong or the DB isn't reachable. For Supabase/Neon, make sure you copied the *pooled* connection string and added `?sslmode=require`.

**"Stripe webhook signature failed"** — The webhook signing secret doesn't match. Re-copy from Stripe dashboard. Also verify the webhook handler is using `express.raw()` not `express.json()`.

**CORS error in browser** — Set `FRONTEND_URL` in `.env` to match exactly where your frontend is served from (including protocol and port).

**File uploads fail in production** — Local disk storage doesn't survive container restarts on Railway/Fly. Switch to S3 (set `UPLOAD_DRIVER=s3` and AWS credentials).

## Security notes

This codebase implements:
- Bcrypt password hashing (cost factor 12)
- JWT tokens with configurable expiry
- Rate limiting on all endpoints (tighter on auth)
- Helmet for security headers
- Zod validation on every request body
- SQL injection protection (Prisma uses parameterized queries)
- Multer file type allowlist + size cap
- Webhook signature verification

It does NOT (yet) implement:
- Email verification on signup
- Password reset flow
- 2FA
- Audit logging of sensitive actions
- Encryption at rest for financial overrides
- Per-user data export endpoint (for GDPR compliance)

For an MVP launch, what's there is enough. For enterprise customers handling regulated data, you'll want to add the missing pieces.

## License

MIT — use freely.
