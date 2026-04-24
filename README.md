# WinGroX AI - Enterprise Application

## Overview
Enterprise Growth Intelligence Operating System built with modern web technologies.

**Stack**: Next.js + NestJS + PostgreSQL + Redis

## Quick Start
This is a phased development project. Each phase includes frontend components, backend APIs, and database changes.

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker (recommended)

### Directory Structure
```
wingrox-ai/
├── frontend/          Next.js application
├── backend/           NestJS API server
├── shared/            Shared types & constants
├── .github/           Instructions, agents, workflows
├── docs/              Design system & architecture
└── copilot-instructions.md  Development guidelines
```

## Development Phases

### PHASE 1: Foundation (Completed)
- [x] Project structure setup
- [x] Design system documentation
- [x] Next.js project initialization
- [x] NestJS project initialization
- [x] Database schema design
- [x] Component library foundation

### PHASE 2: Core Features
- [x] User authentication & session
- [x] Dashboard layouts
- [x] API client & data fetching
- [x] Database migrations
- [x] Accounts API module
- [x] Dashboard chart integration
- [x] Protected route middleware
- [x] Phase 2 integration tests

### PHASE 3: Analytics & Reporting
- [x] Chart components
- [x] Reporting APIs
- [x] Export functionality
- [x] Real-time data sync (SSE)
- [x] Segmented drill-down analytics (country/industry/stage)
- [x] Report pagination and caching layer

### PHASE 4: Advanced Features
- Multi-tenant support
- Advanced RBAC
- Audit logging
- Background jobs

## Commands
(Will be added after project initialization)

## Design System
See `DESIGN_SYSTEM.css` for complete token reference.

**Key Tokens**:
- **Colors**: Gold accents, semantic colors (Teal, Sage, Rose, Slate, Amber)
- **Typography**: Playfair Display (display), Outfit (body), JetBrains Mono (code)
- **Spacing**: 4px scale (xs → 4xl)
- **Shadows**: 4 levels (sm → xl)
- **Animations**: fadeUp, fadeIn, shimmer, spin

## Development Guidelines
1. Follow instructions in `copilot-instructions.md`
2. Use `.github/instructions/` for specific domains
3. Check `/memories/session/phase-roadmap.md` for current phase tasks
4. Use Explore agent for codebase discovery
5. Batch file operations with `multi_replace_string_in_file`

## Security
All endpoints require:
- Input validation (Zod)
- Authentication (JWT)
- Authorization (RBAC)
- Audit logging

## Documentation
- API: OpenAPI/Swagger (auto-generated from NestJS)
- Components: Storybook (Phase 2+)
- Architecture: `/docs` folder
