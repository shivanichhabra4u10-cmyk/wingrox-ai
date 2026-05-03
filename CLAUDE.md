# WinGroX AI — Claude Code Instructions

## The Two Laws

1. **`frontend/public/wingrox-os.html` is the visual source of truth.** Every view must match it exactly — structure, copy, CSS variables, spacing. Never invent UI.
2. **No iframes in production.** The `PlatformHtmlViewFrame` iframe approach was a prototype shortcut. All views must be proper React components before shipping.

---

## Prompt Conventions

Use these exact phrases to trigger work. Claude executes the full workflow without asking for clarification.

| Phrase | What happens |
|---|---|
| `view: /[route]` | Full stack: read HTML → build React component → wire to API → TypeScript check |
| `frontend: /[route]` | React component only (backend already exists) |
| `backend: /[route]` | NestJS module only (schema → migration → module → wire HTML) |
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

Open `frontend/public/wingrox-os.html`. Find `#view-[route]`.

Extract exactly:
- Every HTML tag, class name, nesting level
- All text copy and placeholder values
- All `id=` attributes (these are data-binding points)
- All `fetch()` calls and their request/response shapes
- All form inputs and their types

If the view is an iframe stub (no content in HTML), read the existing React component and surrounding HTML context for design language.

### Step 2 — Build the React component

**File:** `frontend/src/components/platform/Platform[View].tsx`

Rules:
- `'use client'` only if the component has user interaction (forms, sliders, clicks)
- Pure display components should be Server Components (no directive)
- Replicate the HTML structure in JSX — same element types, same class hierarchy
- Map HTML class names to CSS Module classes in `Platform[View].module.css`
- All CSS variable references (`var(--gold)`, `var(--ink-08)`, etc.) work as-is — they are defined globally in `wingrox-os.html`'s `<style>` block and must be added to `frontend/src/app/globals.css` if not already there
- No inline styles except where the HTML prototype uses them explicitly
- Props interface must have a Zod schema

### Step 3 — Add loading and error states

Every component that fetches data must have:
- A skeleton placeholder that matches the layout (use `background: var(--ink-08); border-radius: var(--r-sm); animation: shimmer 1.5s infinite` on placeholder divs)
- A silent error fallback (log to console, show last known data or empty state — never crash)

### Step 4 — Wire API calls

- Server Components: use `fetch('/api/...')` directly with `{ cache: 'no-store' }` for live data or `{ next: { revalidate: 60 } }` for semi-static data
- Client Components: use `useEffect` + `fetch` on mount; store in `useState`; show skeleton while loading
- All API base URLs are relative (`/api/...`) — Next.js proxies to backend on port 3001 (see `next.config.js`)
- Pass `assessmentId` from `localStorage.getItem('wg_assessment_id')` where views need personalisation

### Step 5 — TypeScript check

```bash
cd frontend && npx tsc --noEmit   # must return zero errors
cd backend  && npx tsc --noEmit   # must return zero errors
```

Fix every error before marking the view done.

---

## Backend Standards (apply to all modules)

### DTOs — always use class-validator

```typescript
import { IsString, IsEmail, IsOptional, IsInt, Min, Max } from 'class-validator';

export class RunMatchDto {
  @IsString() @IsNotEmpty() company: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() notes?: string;
}
```

Add `ValidationPipe` globally in `main.ts` (already configured).

### Services — no `any` types

```typescript
// ✗ wrong
async getSummary(id: string): Promise<any> { ... }

// ✓ correct
async getSummary(id: string): Promise<DashboardSummaryDto> { ... }
```

### HTTP responses — use correct status codes

```typescript
@Post()               // → 201 Created
@Get()                // → 200 OK
throw new NotFoundException()    // → 404
throw new BadRequestException()  // → 400
```

### DB queries — select only what you need

```typescript
// ✗ wrong — fetches entire row
const a = await this.prisma.expansionAssessment.findUnique({ where: { id } });

// ✓ correct — fetches only needed columns
const a = await this.prisma.expansionAssessment.findUnique({
  where: { id },
  select: { readinessScore: true, cluster: true, topCountries: true },
});
```

### Pagination — all list endpoints

```typescript
async list(page = 1, limit = 20) {
  const [items, total] = await Promise.all([
    this.prisma.model.findMany({ skip: (page - 1) * limit, take: limit }),
    this.prisma.model.count(),
  ]);
  return { items, total, page, limit };
}
```

---

## Frontend Standards

### Component file structure

```
frontend/src/
  app/[route]/
    page.tsx              ← thin wrapper: import + return one component, no logic
  components/platform/
    Platform[View].tsx    ← the actual component
    Platform[View].module.css  ← view-specific CSS (extends shared vars)
```

### CSS — source from HTML prototype

Before writing any CSS:
1. Read `#view-[name]` in `wingrox-os.html`
2. Copy the exact class names used in that view
3. Create matching rules in `Platform[View].module.css`
4. CSS variables (`--gold`, `--ink-08`, etc.) need no redefinition — they're global

Never use Tailwind, MUI, Chakra, or any external CSS library.

### Data fetching pattern — Client Component

```typescript
const [data, setData] = useState<ResponseType | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/[view]/[endpoint]')
    .then(r => r.json())
    .then(res => { if (res.success) setData(res.data); })
    .catch(() => {}) // silent — show stale/default data
    .finally(() => setLoading(false));
}, []);

if (loading) return <SkeletonLayout />;
```

### Skeleton pattern

```tsx
const Skeleton = ({ w = '100%', h = 20 }: { w?: string; h?: number }) => (
  <div style={{ width: w, height: h, background: 'var(--ink-08)', borderRadius: 'var(--r-sm)', animation: 'shimmer 1.5s infinite' }} />
);
```

---

## Backend Status

| Route | Backend | DB Tables | Key Endpoints |
|---|---|---|---|
| `/` | — | — | none |
| `/dashboard` | ✅ | `expansion_assessments` (read) | `GET /api/dashboard/overview?assessmentId=` |
| `/twin` | ✅ | `twin_assessments` | `POST /api/twin-assessment/otp/send`, `/verify`, `/progress`, `/complete` |
| `/expansion` | ✅ | `expansion_assessments`, `expansion_countries` | `POST /api/expansion/assessment` |
| `/intel` | ✅ | `expansion_assessments` | Reuses expansion assessment endpoint |
| `/match` | ✅ | `match_sessions`, `match_discovery_calls` | `POST /api/match/run`, `POST /api/match/book-call` |
| `/hub` | ✅ | `hub_saves` | `GET /api/hub/feed`, `POST /api/hub/save` |
| `/sim` | ✅ | `sim_runs`, `sim_unlocks` | `POST /api/sim/run`, `GET /api/sim/last`, `POST /api/sim/unlock` |
| `/eco` | ✅ | `eco_applications` | `POST /api/eco/apply`, `GET /api/eco/status`, `GET /api/eco/stats` |

## Frontend Status

| Route | Approach | Status | Notes |
|---|---|---|---|
| `/` | Custom (`PlatformHome`) | ✅ | Static marketing |
| `/dashboard` | Custom (`PlatformDashboard`) | ✅ | API-wired, score ring animation |
| `/twin` | Custom (`PlatformTwin`) | ✅ | OTP + assessment flow |
| `/expansion` | Custom (`ExpansionNavigator`) | ✅ | Full readiness flow |
| `/intel` | Custom (`PlatformIntel`) | ✅ | API-wired, score ring, async generate |
| `/match` | Custom (`PlatformMatch`) | ✅ | 4-step stepper, async match, discovery call modal |
| `/hub` | Custom (`PlatformHub`) | ✅ | Sidebar filters, personalised feed, save toggle |
| `/sim` | Custom (`PlatformSim`) | ✅ | 6-tab simulator, live sliders, Chart.js, paywall gate |
| `/eco` | Custom (`PlatformEco`) | ✅ | Application form |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript strict |
| Styling | CSS Modules + CSS variables from `wingrox-os.html` |
| Validation | Zod (component props) + class-validator (API DTOs) |
| Backend | NestJS, global prefix `/api`, port 3001 |
| ORM | Prisma + PostgreSQL (`wingrox_db`) |
| Auth | JWT (access + refresh tokens) |

## Development

```bash
cd frontend && npm run dev    # port 3000
cd backend  && npm run dev    # port 3001

# After Prisma schema change (kill node first):
Stop-Process -Name node -Force
cd backend && npx prisma migrate dev --name [name] --skip-seed
```

## Performance Targets (production)

- API response p95: < 200ms
- Frontend skeleton visible: < 100ms (instant — no API wait)
- Data populated: < 500ms
- No N+1 queries — use Prisma `select` + `include`, not separate calls
- No blocking serial fetches — use `Promise.all` for parallel queries
