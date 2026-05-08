# WinGroX AI — Claude Code Instructions

## The Two Laws

1. **`frontend/wingrox-os.html` is the visual source of truth.** Every view must match it exactly — structure, copy, CSS variables, spacing. Never invent UI.
2. **No iframes in production.** The iframe stubs in `wingrox-os.html` (e.g. `#view-expansion`, `#view-eco`) are prototype shortcuts. All views must be implemented as native HTML sections (or future React components) before shipping.

---

## Prompt Conventions

Use these exact phrases to trigger work. Claude executes the full workflow without asking for clarification.

| Phrase | What happens |
|---|---|
| `view: /[route]` | Full stack: read HTML → build React component → wire to API → TypeScript check |
| `frontend: /[route]` | React component only (backend already exists) |
| `backend: /[route]` | Express route only (schema → migration → route file → wire HTML) |
| `fix: /[route]` | Debug and fix a specific view's current issues |

**Iteration order for `view:` prompts (do one at a time, confirm before next):**
1. `view: /dashboard`
2. `view: /intel`
3. `view: /match`
4. `view: /hub`
5. `view: /sim`
6. `view: /expansion`
7. `view: /twin`
8. `view: /eco`
9. `view: /` (landing)

---

## View Workflow — `view: /[route]`

Execute all steps in order. No skipping.

### Step 1 — Read the HTML prototype

Open `frontend/wingrox-os.html`. Find `#view-[route]` (or the matching `<section id="view-[route]">`).

Extract exactly:
- Every HTML tag, class name, nesting level
- All text copy and placeholder values
- All `id=` attributes (these are data-binding points)
- All `fetch()` calls and their request/response shapes
- All form inputs and their types

If the view is an iframe stub (`<div class="view view-iframe" id="view-[route]">`), expand it in-place: replace the iframe with a full `<section>` matching the design language of adjacent views.

### Step 2 — Build the view section

**Current approach: native HTML + vanilla JS inside `frontend/wingrox-os.html`**

Rules:
- Add the view's full HTML inside `<div class="view" id="view-[route]">` (replacing any iframe stub)
- Reuse existing CSS classes from the `<style>` block at the top of `wingrox-os.html`
- CSS variables (`var(--gold)`, `var(--ink-08)`, etc.) are globally defined — never redefine them
- All API calls go in `frontend/wingrox-api-adapter.js` as a named function on `window`
- No inline `<script>` blocks inside view divs — all JS goes in the adapter or the existing `<script>` at the bottom of the HTML

**Future React approach (when framework is added):**
- File: `frontend/src/components/platform/Platform[View].jsx`
- Directory `frontend/src/components/platform/` exists but is currently empty — no framework is installed yet

### Step 3 — Add loading and error states

Every section that fetches data must have:
- A skeleton placeholder div shown while the API call is in flight (use `background: var(--ink-08); border-radius: var(--r-sm); animation: shimmer 1.5s infinite`)
- A silent error fallback — catch all fetch errors, log to console, show last known data or empty state, never crash or show a blank view

### Step 4 — Wire API calls

- All API calls use the `api()` helper in `frontend/wingrox-api-adapter.js` — never call `fetch` directly in HTML
- The base URL is configured via `window.WINGROX_API_BASE` (defaults to `http://localhost:4000/api`)
- Auth token is automatically injected by the `api()` helper from `localStorage`
- Pass `assessmentId` from `localStorage.getItem('wg_assessment_id')` where views need personalisation
- Expose new API methods as properties of `window.wingroxExpansion`, `window.wingroxIntel`, etc. — one namespace per view

### Step 5 — Smoke test

```bash
# Start backend, then open the HTML file in browser
cd backend && npm run dev   # port 4000
# Open frontend/wingrox-os.html in browser (or via live-server)
# Navigate to the view, fill the form, verify network tab shows API call and 201 response
```

Verify: form submits → backend receives request → DB row created → result renders correctly.

---

## Backend Standards (apply to all Express routes)

### Validation — always use Zod

```javascript
import { z } from 'zod';

const runMatchSchema = z.object({
  company: z.string().min(1).max(200),
  email:   z.string().email(),
  notes:   z.string().max(1000).optional(),
});

// In route handler:
const parsed = runMatchSchema.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' });
}
const data = parsed.data;
```

### HTTP responses — use correct status codes

```javascript
res.status(201).json({ ... })   // POST that creates a resource
res.json({ ... })               // GET (200 default)
res.status(404).json({ error: 'Not found' })
res.status(400).json({ error: 'Invalid input' })
```

### DB queries — select only what you need

```javascript
// ✗ wrong — fetches entire row
const a = await prisma.expansionAssessment.findUnique({ where: { id } });

// ✓ correct — fetches only needed columns
const a = await prisma.expansionAssessment.findUnique({
  where: { id },
  select: { readinessScore: true, cluster: true, topCountries: true },
});
```

### Pagination — all list endpoints

```javascript
async function list(page = 1, limit = 20) {
  const [items, total] = await Promise.all([
    prisma.model.findMany({ skip: (page - 1) * limit, take: limit }),
    prisma.model.count(),
  ]);
  return { items, total, page, limit };
}
```

### Async errors — always use asyncHandler

```javascript
import { asyncHandler } from '../middleware/errorHandler.js';

router.get('/path', requireAuth, asyncHandler(async (req, res) => {
  // throws are caught and forwarded to the global error handler
}));
```

---

## Frontend Standards

### Current architecture — static HTML + vanilla JS

```
frontend/
  wingrox-os.html          ← single-file platform app (ALL views live here)
  wingrox-api-adapter.js   ← backend integration layer (included as last <script>)
  src/components/platform/ ← empty — placeholder for future React components
  vercel.json              ← rewrites / → /wingrox-os.html for Vercel deployment
```

### Adding a new view section

1. Find the right insertion point in `wingrox-os.html` (views are grouped by nav order)
2. Add `<div class="view" id="view-[name]">` — replace any existing iframe stub
3. Reuse existing CSS classes from the `<style>` block — no new `<style>` tags
4. CSS variables (`--gold`, `--ink-08`, `--r-sm`, etc.) are global — never redefine
5. Wire API calls via `wingrox-api-adapter.js` — add a `window.wingrox[ViewName]` namespace

Never use Tailwind, MUI, Chakra, or any external CSS library.

### Data fetching pattern — vanilla JS

```javascript
// In wingrox-api-adapter.js, add a namespace:
window.wingroxExpansion = {
  async submitAssessment(payload) {
    return api('/expansion/assessment', { method: 'POST', body: JSON.stringify(payload) });
  },
};

// In the view's JS function:
async function submitForm() {
  const skeletonEl = document.getElementById('result-skeleton');
  const resultEl   = document.getElementById('result-panel');
  skeletonEl.style.display = 'block';
  resultEl.style.display   = 'none';
  try {
    const { assessment } = await window.wingroxExpansion.submitAssessment(payload);
    localStorage.setItem('wg_assessment_id', assessment.id);
    renderResult(assessment);
  } catch (err) {
    console.error(err);
    // show friendly error inline — never alert()
  } finally {
    skeletonEl.style.display = 'none';
  }
}
```

### Skeleton pattern — HTML

```html
<div id="result-skeleton" style="display:none">
  <div style="width:100%;height:20px;background:var(--ink-08);border-radius:var(--r-sm);animation:shimmer 1.5s infinite"></div>
</div>
```

---

## Backend Status

> Backend is **Express.js** (not NestJS). All routes are in `backend/src/routes/`. Port **4000**.

| Route | Route File | DB Table(s) | Key Endpoints |
|---|---|---|---|
| `/` | — | — | none |
| `/expansion` & `/intel` | `routes/expansion.js` | `expansion_assessments` | `POST /api/expansion/assessment`, `GET /api/expansion/assessments`, `GET /api/expansion/usage` |
| `/sessions` (twin) | `routes/sessions.js` | `diagnostic_sessions` | `POST /api/sessions`, `PATCH /api/sessions/:id`, `POST /api/sessions/:id/complete` |
| `/auth` | `routes/auth.js` | `users` | `POST /api/auth/signup`, `/login`, `/me`, `PATCH /api/auth/upgrade` |
| `/files` | `routes/files.js` | `uploaded_files` | `POST /api/files`, `GET /api/files`, `DELETE /api/files/:id` |
| `/leads` | `routes/leads.js` | `advisor_leads` | `POST /api/leads` |
| `/payments` | `routes/payments.js` | `payments` | Stripe integration |
| `/match` | `routes/match.js` | `match_requests`, `discovery_calls` | `POST /api/match`, `GET /api/match`, `POST /api/match/book-call` |
| `/eco` | `routes/eco.js` | `eco_partner_applications` | `POST /api/eco/apply`, `GET /api/eco/applications` |

> **Note:** `/dashboard`, `/hub`, `/sim` routes do **not exist yet** in the backend.

## Frontend Status

> Frontend is a **single static HTML file**: `frontend/wingrox-os.html` + `frontend/wingrox-api-adapter.js`. No React/Next.js framework is installed. `frontend/src/components/platform/` is empty.

| Route (view id) | HTML Section | API Wired | Notes |
|---|---|---|---|
| `#view-home` | ✅ Full HTML | ❌ | Static marketing only |
| `#view-dashboard` | ✅ Full HTML | ❌ | Client-side mock data only |
| `#view-twin` | ✅ Full HTML | ⚠️ Partial | `wingrox-api-adapter.js` wires sessions/files/auth |
| `#view-intel` | ✅ Full HTML | ✅ Wired | `intelRenderReport()` calls `wingroxExpansion.submitAssessment()`; saves to DB; stores `wg_assessment_id` in localStorage |
| `#view-expansion` | ✅ iframe (PLATFORM_NAVIGATOR) | ✅ Wired | 75-question quiz; `postMessage` bridge → `wingroxExpansion.submitAssessment()`; saves `wg_assessment_id` to localStorage |
| `#view-match` | ✅ Full HTML | ✅ Wired | `wingroxMatch.run()` → `POST /api/match`; `wingroxMatch.bookCall()` → `POST /api/match/book-call`; result saved to DB |
| `#view-hub` | ✅ Full HTML | ❌ | No backend route exists |
| `#view-sim` | ✅ Full HTML | ❌ | No backend route exists |
| `#view-eco` | ❌ iframe stub (PLATFORM_ECOSYSTEM) | ✅ Wired | postMessage bridge: `wingrox:partner:apply` → `wingroxEco.apply()` → `POST /api/eco/apply`; saves to DB |
| `#view-atlas` | ✅ Full HTML | ❌ | Static only |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Static HTML + vanilla JS (`frontend/wingrox-os.html`) |
| Styling | CSS custom properties (variables) inline in `wingrox-os.html` `<style>` block |
| API adapter | `frontend/wingrox-api-adapter.js` — plain JS, loaded as last `<script>` tag |
| Backend | **Express.js** (ES modules), port **4000**, global prefix `/api` |
| Validation | **Zod** (backend input validation — no class-validator, no decorators) |
| ORM | Prisma + PostgreSQL |
| Auth | JWT via `backend/src/lib/auth.js` (`verifyToken` / `signToken`) |
| Hosting | Vercel (frontend static) + any Node host (backend) |

## Development

```bash
# Backend (Express, port 4000 — uses node --watch, no restart needed for most changes)
cd backend && npm run dev

# Frontend — open the HTML file directly in browser, or use a static file server:
npx live-server frontend   # serves frontend/ at http://localhost:8080
# Set WINGROX_API_BASE in the HTML or via localStorage before testing

# After Prisma schema change (kill the node process first on Windows):
Stop-Process -Name node -Force
cd backend ; npx prisma db push      # fast schema sync (dev only)
# OR for a tracked migration:
cd backend ; npx prisma migrate dev --name [name]

# View DB:
cd backend && npx prisma studio      # opens http://localhost:5555
```

## Performance Targets (production)

- API response p95: < 200ms
- Frontend skeleton visible: < 100ms (instant — no API wait)
- Data populated: < 500ms
- No N+1 queries — use Prisma `select` + `include`, not separate calls
- No blocking serial fetches — use `Promise.all` for parallel queries
