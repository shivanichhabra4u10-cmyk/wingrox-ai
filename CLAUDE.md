# WinGroX AI — Claude Code Instructions

## Golden Rule: HTML Prototype is the Source of Truth

The file `frontend/public/wingrox-os.html` is the authoritative visual reference for all UI work. Every platform view **must match the HTML prototype pixel-for-pixel**. Do not invent layouts, components, or styles that are not already present in the HTML.

---

## UI Alignment Strategy

### 1. Always check `wingrox-os.html` first

Before building or modifying any platform view, read the relevant `#view-<name>` section in `wingrox-os.html`. Extract:
- Exact HTML structure (tags, class names, nesting)
- All CSS class names — map them directly, never rename
- All text labels, copy, and placeholder values
- All interactive elements and their IDs

### 2. Use `PlatformHtmlViewFrame` for views with full HTML content

`frontend/src/components/platform/PlatformHtmlViewFrame.tsx` fetches `wingrox-os.html`, injects a CSS override to show only `#view-${viewName}`, and renders it in an `<iframe srcDoc>`. This gives an **exact pixel match at zero cost** — no custom React needed.

**Use this approach whenever `#view-<name>` has real content in the HTML.**

Current routes using this approach (do not replace with custom React):
| Route | viewName |
|---|---|
| `/dashboard` | `dashboard` |
| `/intel` | `intel` |
| `/match` | `match` |
| `/hub` | `hub` |
| `/sim` | `sim` |

To add a new iframe-backed route:
```tsx
import { PlatformHtmlViewFrame } from '@/components/platform/PlatformHtmlViewFrame';
export default function MyPage() {
  return (
    <PlatformHtmlViewFrame
      active="<nav-key>"
      title="<page title>"
      loadingText="Loading..."
      viewName="<view-name>"
    />
  );
}
```
Also add `viewName` to the `PlatformViewNameSchema` Zod enum in `PlatformHtmlViewFrame.tsx`.

### 3. Build custom React only for empty iframe stubs

Some views in `wingrox-os.html` are empty `<iframe>` stubs with no content. For these, build a custom React component that **visually replicates the intended design** using the surrounding HTML context, color palette, and UI patterns from the prototype.

Current custom components for stub views:
| Route | Component | Reason |
|---|---|---|
| `/` | `PlatformHome` | Marketing/landing page |
| `/twin` | `PlatformTwin` | OTP + phase-step flow |
| `/expansion` | `ExpansionNavigator` | Stub in HTML |
| `/eco` | `PlatformEco` | Stub in HTML |

### 4. Never diverge from the HTML design

- Do not add UI elements, sections, or panels that are not in `wingrox-os.html`
- Do not rename CSS classes or change layout structure
- Do not introduce a UI library (Tailwind, MUI, Chakra) that conflicts with the existing CSS
- Do not invent data or metrics — use the same placeholder values from the HTML

---

## Backend-Per-View Workflow

**Trigger phrase:** `"backend: /[route]"` — e.g. `"backend: /dashboard"`

When you receive this prompt, execute the full process below without asking for clarification.

### Step 1 — Audit the UI

Read the view's content to identify every piece of data the UI needs:
- **iframe views** (`/dashboard`, `/intel`, `/match`, `/hub`, `/sim`): read `#view-<name>` in `frontend/public/wingrox-os.html` — look at every element with an `id`, every `fetch()` call in inline `<script>` tags, every form field, and every data value rendered in the HTML
- **Custom React views** (`/twin`, `/expansion`, `/eco`): read the component file in `frontend/src/components/platform/`

Extract:
1. All form inputs → DTO request fields
2. All displayed data (metrics, lists, cards) → response fields + DB columns
3. All existing `fetch()` / API calls already in the HTML → keep those exact URL paths

### Step 2 — Design the data model

Add new tables or columns to `backend/prisma/schema.prisma`. Rules:
- One table per logical entity (e.g. `twin_assessments`, `match_sessions`)
- Use snake_case for table and column names
- Always include `id String @id @default(uuid())`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- Add `sessionId String?` on assessment tables so anonymous users can retrieve their result

### Step 3 — Create and apply the migration

```bash
# From backend/
npx prisma migrate dev --name <migration_name>
# If DLL lock error on Windows, first run:
Stop-Process -Name node -Force   # in PowerShell
```

Then regenerate the client: `npx prisma generate`

### Step 4 — Build the NestJS module

Create `backend/src/modules/<view>/` with:
- `<view>.module.ts` — imports PrismaModule
- `<view>.controller.ts` — defines routes, uses class-validator decorators
- `<view>.service.ts` — all business logic, calls PrismaService
- `dto/<action>.dto.ts` — one DTO per request body, all fields decorated with `class-validator`

**URL convention:** all endpoints under `/api/<view>/...`

Register the module in `backend/src/app.module.ts`.

### Step 5 — Wire the frontend

- **iframe views**: the `wingrox-os.html` JS calls the API directly. Update the inline `<script>` in `wingrox-os.html` to call the correct `/api/<view>/...` endpoint, passing the right payload and rendering the response. Mirror the pattern used in `intelGenerate()` / `intelRenderReport()` for the intel view.
- **Custom React views**: update the component's `fetch()` call to hit the new endpoint. Update types to match the response shape.

### Step 6 — Verify

1. `npx tsc --noEmit` in `frontend/` — zero errors
2. Restart backend, call the endpoint with `curl` or describe the test
3. Confirm DB row is created via Prisma Studio or a SELECT query

---

## Backend Status per View

| Route | Backend | DB Table | Notes |
|---|---|---|---|
| `/` | — | — | Static marketing, no backend needed |
| `/dashboard` | ✅ done | `expansion_assessments` (read) | `GET /api/dashboard/overview?assessmentId=` |
| `/twin` | ✅ done | `twin_assessments` | OTP + progress + complete via `TwinAssessmentModule` |
| `/expansion` | ✅ done | `expansion_assessments` | Full readiness assessment API |
| `/intel` | ✅ done | `expansion_assessments` | Reuses `/api/expansion/assessment` |
| `/match` | ✅ done | `match_sessions`, `match_discovery_calls` | `POST /api/match/run`, `POST /api/match/book-call` |
| `/hub` | ✅ done | `hub_saves` | `GET /api/hub/feed`, `POST /api/hub/save`, `GET /api/hub/saves` |
| `/sim` | ✅ done | `sim_runs`, `sim_unlocks` | `POST /api/sim/run`, `GET /api/sim/last`, `POST /api/sim/unlock` |
| `/eco` | ✅ done | `eco_applications` | `POST /api/eco/apply`, `GET /api/eco/status`, `GET /api/eco/stats` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | CSS Modules (`*.module.css`) + inline classes from HTML prototype |
| Validation | Zod (all component props and API payloads) |
| Backend | NestJS, global prefix `api`, port 3001 |
| ORM | Prisma + PostgreSQL (`wingrox_db`) |
| Auth | JWT (access + refresh tokens) |

---

## Project Structure

```
frontend/
  public/wingrox-os.html          ← HTML prototype (source of truth)
  src/
    app/                          ← Next.js route pages (thin wrappers only)
    components/platform/          ← All platform UI components
      PlatformHtmlViewFrame.tsx   ← iframe-based exact HTML renderer
      PlatformNav.tsx             ← Top navigation bar
      Platform*.tsx               ← Per-view custom components (stubs only)

backend/
  src/modules/                    ← NestJS feature modules
    expansion/                    ← ✅ done — readiness assessment
  prisma/schema.prisma            ← Database schema
  prisma/migrations/              ← Applied migrations
```

---

## Code Conventions

- **Page files are thin**: `app/*/page.tsx` files only import and return one component — no logic
- **Props validated with Zod**: every component's props object must have a Zod schema
- **No comments on obvious code**: only add comments for non-obvious constraints or workarounds
- **No extra abstractions**: solve the problem directly, do not over-engineer
- **TypeScript strict**: run `npx tsc --noEmit` in `frontend/` after any change to verify zero errors
- **After Prisma schema changes**: kill the backend Node process first (`Stop-Process -Name node -Force` in PowerShell), then run `npx prisma generate` and `npx prisma migrate deploy` from `backend/`

---

## Development Servers

```bash
# Frontend (port 3000)
cd frontend && npm run dev

# Backend (port 3001)
cd backend && npm run dev
```

---

## View Inventory (all 9 views)

| Route | HTML view ID | UI Approach | Backend |
|---|---|---|---|
| `/` | — | Custom (`PlatformHome`) | none |
| `/dashboard` | `#view-dashboard` | `PlatformHtmlViewFrame` | ✅ done |
| `/twin` | stub | Custom (`PlatformTwin`) | ✅ done |
| `/expansion` | stub | Custom (`ExpansionNavigator`) | ✅ done |
| `/intel` | `#view-intel` | `PlatformHtmlViewFrame` | ✅ done |
| `/match` | `#view-match` | `PlatformHtmlViewFrame` | ✅ done |
| `/hub` | `#view-hub` | `PlatformHtmlViewFrame` | ✅ done |
| `/sim` | `#view-sim` | `PlatformHtmlViewFrame` | ✅ done |
| `/eco` | stub | Custom (`PlatformEco`) | ✅ done |
