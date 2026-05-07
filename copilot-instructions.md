# WinGroX AI — Copilot Instructions

## Core Rules

1. `frontend/wingrox-os.html` is the single visual source of truth.
   - Match structure, spacing, IDs, copy, and CSS variables exactly.
   - Never invent UI patterns.

2. No iframes in production.
   - Replace iframe stubs with native HTML sections.
   - Reuse adjacent design language.

3. Frontend architecture is:
   - Static HTML
   - Vanilla JavaScript
   - Single-file platform app
   - No React currently installed

4. Never use:
   - Tailwind
   - MUI
   - Chakra
   - External CSS frameworks

---

# Project Architecture

## Frontend

frontend/
├── wingrox-os.html
├── wingrox-api-adapter.js
├── src/components/platform/
└── vercel.json

### Rules

- All views live inside `frontend/wingrox-os.html`
- All API calls go through `wingrox-api-adapter.js`
- No inline scripts inside view sections
- Reuse existing CSS classes and CSS variables
- Never redefine CSS variables

### Global CSS Variables

Use existing variables only:

- `var(--gold)`
- `var(--ink-08)`
- `var(--r-sm)`

---

# Backend

## Stack

- Express.js
- ES Modules
- Prisma
- PostgreSQL
- Zod validation
- JWT auth

## Port

Backend runs on:

```bash
http://localhost:4000/api