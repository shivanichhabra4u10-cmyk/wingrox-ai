# WinGroX Deployment Runbook

**Goal:** Get `wingrox-os.html` + backend live on the public internet, accepting real users, in under 2 hours.

---

## Prerequisites

You'll need accounts at:
- **GitHub** (free) — for version control
- **Vercel** (free) — for the frontend  
- **Railway** (free trial, ~$5/month after) — for the backend + database
- **Cloudflare** (free) — for the domain DNS + R2 storage (when needed)
- **Stripe** (free) — for payments
- **Slack** (free) — for advisor lead notifications

You'll need installed locally:
- Git
- Node.js 18+ (`node -v` should print v18 or higher)
- A code editor (VS Code recommended)

---

## Phase 1 · Local development first (30 minutes)

Always test locally before deploying. Trust this — debugging in production is 10× harder.

### 1.1 — Get the code running locally

```bash
# Unzip the backend
unzip wingrox-backend.zip
cd wingrox-backend-build

# Install dependencies
npm install

# Copy the env template
cp .env.example .env
```

### 1.2 — Set up a local Postgres

Easiest path is Docker:

```bash
docker run --name wingrox-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=wingrox \
  -p 5432:5432 -d postgres:16
```

If you don't have Docker, use Postgres.app (Mac) or the official installer (Windows/Linux).

### 1.3 — Configure your `.env`

Edit `.env` with your editor:

```
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5500

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wingrox

# Generate this with: openssl rand -base64 32
JWT_SECRET=paste-the-32-char-random-string-here
JWT_EXPIRES_IN=30d

# Leave Stripe blank for now
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_VANGUARD_PRICE_ID=

# Optional but recommended for testing
SLACK_WEBHOOK_URL=

UPLOAD_DRIVER=local
UPLOAD_DIR=./uploads
MAX_UPLOAD_MB=20

ADVISOR_EMAIL=advisor@wingrox.ai
```

### 1.4 — Initialize the database

```bash
npm run db:push       # Creates all 5 tables
npm run db:generate   # Generates Prisma client types
```

You should see `Your database is now in sync with your Prisma schema.` Done.

### 1.5 — Start the backend

```bash
npm run dev
```

You should see:
```
✓ WinGroX API listening on http://localhost:4000
```

### 1.6 — Test the API

Open a new terminal and run:

```bash
# Health check
curl http://localhost:4000/api/health
# Expect: {"status":"ok","timestamp":"..."}

# Create a test user
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@wingrox.ai","password":"password123","name":"Test"}'
# Expect: {"user":{"id":"...","email":"test@wingrox.ai","tier":"NUCLEUS"},"token":"eyJ..."}
```

### 1.7 — Wire the frontend

Place `wingrox-os.html` in a folder and add this **right before `</body>`**:

```html
<script>
  window.WINGROX_API_BASE = 'http://localhost:4000/api';
</script>
<script src="wingrox-api-adapter.js"></script>
```

Copy `wingrox-api-adapter.js` from `wingrox-backend-build/public/` into the same folder.

Open the HTML in a browser using a static file server (don't use `file://` — CORS will fail):

```bash
# In the folder with wingrox-os.html
npx serve -p 5500
```

Open http://localhost:5500/wingrox-os.html. The diagnostic should work, and the browser console should print `✓ WinGroX backend adapter wired`.

### 1.8 — Verify end-to-end

1. Open browser DevTools → Network tab
2. Sign up via the API directly:
   ```javascript
   await wingroxAuth.signup('founder@example.com', 'pass1234', 'Founder')
   ```
3. Click "Begin diagnosis" — you should see a `POST /api/sessions` request go through
4. Answer a question — you should see a `PATCH /api/sessions/:id` after 800ms
5. In a Postgres GUI (DBeaver, TablePlus, or `npm run db:studio`), confirm the session row exists with your answer

If all the above works, you're ready to deploy.

---

## Phase 2 · Push to GitHub (10 minutes)

### 2.1 — Initialize git in the backend folder

```bash
cd wingrox-backend-build
git init
git add .
git commit -m "Initial commit"
```

### 2.2 — Create a GitHub repo

Go to https://github.com/new — create a private repo named `wingrox-backend`. Don't add README/license (you have one).

Then push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/wingrox-backend.git
git branch -M main
git push -u origin main
```

### 2.3 — Same for the frontend

```bash
mkdir wingrox-frontend
cd wingrox-frontend
# Copy wingrox-os.html and wingrox-api-adapter.js into this folder
git init
git add .
git commit -m "Initial commit"
# Create a github repo `wingrox-frontend`
git remote add origin https://github.com/YOUR_USERNAME/wingrox-frontend.git
git branch -M main
git push -u origin main
```

---

## Phase 3 · Deploy backend to Railway (20 minutes)

### 3.1 — Create the Railway project

1. Go to https://railway.app
2. Sign in with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Pick your `wingrox-backend` repo
5. Railway will auto-detect Node.js

### 3.2 — Add Postgres

1. In your project view, click **+ New** → **Database** → **PostgreSQL**
2. Railway provisions it in ~30 seconds
3. Click on the Postgres service → **Variables** tab
4. Copy the `DATABASE_URL` value

### 3.3 — Configure backend environment variables

1. Click on your backend service → **Variables** tab
2. Add these one by one (click "+ New Variable"):

```
DATABASE_URL=<paste from step 3.2>
JWT_SECRET=<run: openssl rand -base64 32>
JWT_EXPIRES_IN=30d
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-domain.com   (you'll update this in Phase 4)
ADVISOR_EMAIL=advisor@wingrox.ai
UPLOAD_DRIVER=local
UPLOAD_DIR=/tmp/uploads
MAX_UPLOAD_MB=20
```

Leave Stripe and Slack blank for now.

### 3.4 — Tell Railway how to build

1. Click on your backend service → **Settings** tab
2. Under **Build Command**: `npm install && npm run db:generate`
3. Under **Start Command**: `npx prisma db push --accept-data-loss && npm start`

   The `db push` runs on every deploy and is idempotent — safe.

### 3.5 — Get a public URL

1. Click **Settings** → **Networking** → **Generate Domain**
2. You'll get something like `wingrox-backend-production-abc123.up.railway.app`
3. Test it:
   ```bash
   curl https://wingrox-backend-production-abc123.up.railway.app/api/health
   ```

### 3.6 — Buy a domain (optional but recommended)

1. Buy `wingrox.ai` from Cloudflare Registrar (~$12/year, no markup)
2. In Cloudflare DNS, add a CNAME: `api` → your Railway domain
3. In Railway → Networking → Custom Domain → add `api.wingrox.ai`
4. Now your API lives at `https://api.wingrox.ai/api/health`

---

## Phase 4 · Deploy frontend to Vercel (10 minutes)

### 4.1 — Connect Vercel to GitHub

1. Go to https://vercel.com → sign in with GitHub
2. Click **Add New Project** → import your `wingrox-frontend` repo
3. Framework: **Other** (it's plain HTML)
4. Root Directory: leave as `/`
5. Click **Deploy**

You'll get a URL like `wingrox-frontend.vercel.app`.

### 4.2 — Update frontend to point at production API

In `wingrox-os.html`, find the script line and change:

```html
<script>
  window.WINGROX_API_BASE = 'https://api.wingrox.ai/api';
</script>
```

Commit and push — Vercel auto-deploys on every push.

### 4.3 — Add your domain

1. In Cloudflare DNS, add a CNAME: `app` → `cname.vercel-dns.com`
2. In Vercel → Settings → Domains → add `app.wingrox.ai`
3. Now your frontend lives at `https://app.wingrox.ai`

### 4.4 — Update Railway's CORS to allow your frontend domain

Back in Railway → backend service → Variables:
```
FRONTEND_URL=https://app.wingrox.ai
```

Railway will redeploy automatically.

---

## Phase 5 · Wire up Slack notifications (5 minutes)

This is the easiest win — every advisor lead now pings your Slack instantly.

### 5.1 — Create a Slack incoming webhook

1. In Slack, create a channel like `#wingrox-leads`
2. Go to https://api.slack.com/apps → Create New App → From scratch
3. Name: "WinGroX Lead Bot", workspace: yours
4. Sidebar → **Incoming Webhooks** → toggle on
5. Click **Add New Webhook to Workspace** → pick `#wingrox-leads`
6. Copy the webhook URL (starts with `https://hooks.slack.com/services/...`)

### 5.2 — Add to Railway

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../xxx
```

Now every "Book Strategy Call" or "Email Advisor" click pings your Slack with the user's email, master score, and tier.

---

## Phase 6 · Wire up Stripe (30 minutes)

Skip this entirely if you're running a free beta. Come back when you're ready to charge.

### 6.1 — Create Stripe account

1. Go to https://stripe.com → Sign up (use a real business email)
2. Complete the verification (takes 5 min)
3. Go to https://dashboard.stripe.com/test/apikeys
4. Copy the **Secret key** (starts with `sk_test_`)

### 6.2 — Create the Vanguard product

1. Dashboard → **Products** → **+ Add product**
2. Name: `WinGroX Vanguard — Full Intelligence`
3. Description: `Complete 100-question diagnostic with full report, simulator, projections, and 60-min strategy call.`
4. Pricing: **One-time** · `$199.00` USD
5. Click **Save product**
6. Copy the **Price ID** (starts with `price_`)

### 6.3 — Configure webhook

1. Dashboard → **Developers** → **Webhooks** → **+ Add endpoint**
2. Endpoint URL: `https://api.wingrox.ai/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Click **Add endpoint**
5. Copy the **Signing secret** (starts with `whsec_`)

### 6.4 — Add to Railway

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_VANGUARD_PRICE_ID=price_...
```

### 6.5 — Test in test mode

Use Stripe's test card `4242 4242 4242 4242` with any future expiry and any CVC. After payment, your user's tier should flip to `VANGUARD` automatically (visible in Postgres).

### 6.6 — Switch to live mode

Once tested, switch the toggle in Stripe dashboard from **Test mode** to **Live mode**. Recreate the product, copy the live price ID and webhook secret, update Railway env vars. Done.

---

## Phase 7 · File storage (when ready) (15 minutes)

The default `UPLOAD_DRIVER=local` saves files to Railway's container disk. **Files don't survive container restarts.** For production, switch to Cloudflare R2 (cheapest) or AWS S3.

### Cloudflare R2 setup

1. Cloudflare dashboard → R2 → Create bucket → name it `wingrox-uploads`
2. Settings → API tokens → Create API token → Permissions: Read & Write
3. Copy Access Key ID, Secret Access Key, and account ID

The current backend code stubs S3 support but doesn't fully implement it — you'll need to add the `@aws-sdk/client-s3` package and update `src/routes/files.js` to use S3 when `UPLOAD_DRIVER=s3`. ~2 hours of work.

For an MVP with low file volume, the local driver on Railway is fine — restart frequency is low and you can re-request files from users in the rare event they're lost.

---

## Phase 8 · Pre-launch checklist

Before announcing publicly:

- [ ] Sign up for a real account on production and complete a full diagnostic end-to-end
- [ ] Pay $199 (in test mode first, then live with your own card) and verify tier upgrade
- [ ] Click every probing CTA and confirm Slack pings arrive
- [ ] Run the guided chatbot from start to finish, upload a document, complete it
- [ ] Test on mobile (iOS Safari + Android Chrome)
- [ ] Test in incognito mode (no cached state)
- [ ] Send password reset, signup confirmation emails (skip if Phase 1)
- [ ] Set up basic monitoring: 
  - Railway has built-in logs (Settings → Logs)
  - Add Sentry SDK to backend for error tracking (free tier, 1 hour to set up)
- [ ] Privacy policy page published at `/privacy`
- [ ] Terms of service page at `/terms`
- [ ] Footer link to both
- [ ] Cookie banner if you'll get EU traffic
- [ ] Set up a simple `status.wingrox.ai` page (Better Stack, free)

---

## Phase 9 · Day-1 monitoring

For your first 100 users, watch these manually:

1. **Slack `#wingrox-leads`** — every lead, real-time
2. **Railway logs** — watch for errors (`grep ERROR`)
3. **Stripe dashboard** — payment failures, disputes
4. **Postgres** — sometimes useful: `SELECT COUNT(*), tier FROM users GROUP BY tier;`

Set a 10-minute timer each morning and afternoon for the first week. After ~50 users, automate this with Sentry alerts and a daily metrics email.

---

## Troubleshooting

**"Database error: P1001"** — `DATABASE_URL` wrong or DB unreachable. Verify by running `npm run db:studio` locally with the same URL.

**"CORS error" in browser console** — `FRONTEND_URL` in Railway env vars doesn't exactly match your frontend's origin (including https vs http, trailing slash).

**"Webhook signature failed"** — `STRIPE_WEBHOOK_SECRET` doesn't match. Re-copy from Stripe dashboard. Also verify your webhook handler uses `express.raw()` not `express.json()` (it does, in `src/index.js`).

**"File upload failed"** — Container disk full (Railway free tier has limits). Switch to S3/R2.

**"Token expired" loop** — JWT_SECRET changed between deployments, invalidating existing tokens. Don't change it casually; if you must, force all users to re-login.

**Frontend works locally but not in production** — Check `WINGROX_API_BASE` in your `<script>` tag points at production API URL, not localhost. Browser cache can hide this — hard reload with Cmd+Shift+R.

---

## Rollback plan

If a deploy breaks production:

1. **Railway** → Deployments tab → find the previous working deploy → click **⋯** → **Redeploy**
2. **Vercel** → Deployments tab → previous deploy → **⋯** → **Promote to Production**

Both platforms keep deploy history. You can roll back in <60 seconds.

---

## You're done

Your URLs:
- Frontend: `https://app.wingrox.ai`
- Backend: `https://api.wingrox.ai`
- Database: managed by Railway, daily auto-backup
- Lead capture: posts to your Slack
- Payments: Stripe handles everything

Total monthly cost at this stage: **~$5–15/month** for Railway + domain. Vercel and Slack and Stripe are free until you scale.

Now go get users.
