# WinGroX AI - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Prerequisites
- Node.js 18+
- Docker
- Git

### 1. Start Infrastructure
```bash
docker-compose up -d
# Waits for PostgreSQL and Redis to be ready
```

### 2. Initialize Frontend
```bash
cd frontend
npm install
npm run dev
# Opens http://localhost:3000
```

### 3. Initialize Backend
```bash
cd backend
npm install
npm run build
npm run db:migrate
npm run dev
# Runs on http://localhost:3001
```

---

## 📚 Key Documentation
- **Design System**: `docs/DESIGN_SYSTEM.css` - All tokens, colors, typography
- **Development Guidelines**: `copilot-instructions.md` - How to build components & APIs
- **Component Standards**: `.github/instructions/html-components.instructions.md`
- **API Standards**: `.github/instructions/api-development.instructions.md`
- **Shared Types**: `shared/types.ts` - Common interfaces
- **Phase Plan**: `docs/PHASE_1_TASKS.md` - Current sprint tasks

---

## 🎨 Design System Quick Ref
```css
/* Colors */
var(--gold)        /* Primary accent */
var(--teal)        /* Secondary */
var(--bg-dark)     /* Dark backgrounds */
var(--surface)     /* Cards, containers */

/* Fonts */
var(--f-display)   /* Headlines */
var(--f-body)      /* Body text */
var(--f-mono)      /* Code */

/* Spacing */
var(--spacing-sm)  /* 8px */
var(--spacing-md)  /* 12px */
var(--spacing-lg)  /* 16px */
```

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│ Frontend (Next.js + React + TypeScript)              │
│ - Components (HTML-based design system)              │
│ - TanStack Query (data fetching)                     │
│ - React Hook Form + Zod (forms)                      │
└────────────────────┬─────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼─────────────────────────────────┐
│ Backend (NestJS + Express + TypeScript)              │
│ - REST API with OpenAPI docs                         │
│ - JWT Auth + RBAC                                    │
│ - Audit logging                                      │
└────────────────────┬─────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
     ┌──▼──┐    ┌────▼────┐  ┌───▼──┐
     │ PG  │    │ Prisma  │  │Redis │
     │ 5432│    │  ORM    │  │6379  │
     └─────┘    └─────────┘  └──────┘
```

---

## 📋 Current Phase Tasks
1. [ ] Initialize projects (frontend + backend)
2. [ ] Extract components (Button, Card, Nav)
3. [ ] Database migrations
4. [ ] Auth API endpoints
5. [ ] Login page
6. [ ] User management

See `docs/PHASE_1_TASKS.md` for full checklist.

---

## 🤖 Development Tips

### Using the Design System
1. All colors → CSS variables (`var(--gold)`, etc.)
2. Don't hardcode hex colors or fonts
3. Use spacing scale for consistency
4. Reference `docs/DESIGN_SYSTEM.css` for complete list

### Building Components
1. Extract from `wingrox-os (8).html`
2. Convert to React (`.tsx`)
3. Use CSS Modules (`.module.css`)
4. Add Zod validation for props
5. Example in `.github/instructions/html-components.instructions.md`

### Building APIs
1. Create controller in `backend/src/modules/`
2. Add Zod DTO for validation
3. Implement business logic in service
4. Add RBAC guard if needed
5. Reference `.github/instructions/api-development.instructions.md`

---

## 🔗 Important Files

| Purpose | File |
|---------|------|
| Development rules | `copilot-instructions.md` |
| Design tokens | `docs/DESIGN_SYSTEM.css` |
| TypeScript types | `shared/types.ts` |
| Component guide | `.github/instructions/html-components.instructions.md` |
| API guide | `.github/instructions/api-development.instructions.md` |
| Database schema | `backend/prisma/schema.prisma` |
| Phase tracking | `/memories/session/phase-roadmap.md` |

---

## ⚡ Pro Tips
- Use **Explore agent** for codebase searches (say: "Explore what auth endpoints exist")
- All edits use `multi_replace_string_in_file` for efficiency
- Save space: review `/memories/` before long sessions
- Check `.github/instructions/` before starting a new component/API
