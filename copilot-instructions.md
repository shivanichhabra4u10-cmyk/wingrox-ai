---
name: WinGroX AI - Enterprise Application
description: "Use when: developing WinGroX AI enterprise application. Follow phased approach, preserve HTML design system, use TypeScript for type safety, optimize token usage with agents and batch operations."
---

# WinGroX AI - Development Guidelines

## Core Principles
1. **Phase-driven development**: Work only on current phase tasks
2. **HTML-first component design**: Preserve original design tokens, build components as HTML+CSS modules
3. **Type-safe everywhere**: TypeScript in frontend & backend
4. **Token efficient**: Use agents for exploration, batch file operations, avoid redundant searches
5. **Enterprise standards**: RBAC, audit logs, security-first

## Tech Stack
- Frontend: Next.js 14+ (React, TypeScript)
- Backend: NestJS (TypeScript, modular)
- Database: PostgreSQL + Prisma ORM
- Cache: Redis
- Styling: CSS Modules with design token system

## Design System (from wingrox-os.html)
### Colors
- **Primary**: Dark backgrounds (#1c1a15, #141310)
- **Accent**: Gold (#c9973a, #e8b85a)
- **Semantic**: Teal, Sage, Rose, Slate, Amber (with pale variants)
- **Text**: Ink (#1a1814) with opacity variants

### Typography
- **Display**: Playfair Display (serif, weights: 400, 500, 600)
- **Body**: Outfit (sans-serif, weights: 300-700)
- **Mono**: JetBrains Mono (code, weights: 400, 500)

### Spacing & Border Radius
- Spacing: Use CSS variables `--r-sm`, `--r`, `--r-lg`, `--r-xl`, `--r-full`
- Shadows: `--sh-sm`, `--sh-md`, `--sh-lg`, `--sh-xl`
- Easing: `--ease`, `--ease-out`

## Component Development
1. Extract component from HTML template
2. Convert to Next.js component (TypeScript)
3. Preserve CSS token usage and animations
4. Add prop types and Zod validation
5. Document with Storybook (Phase 2+)

## Folder Structure
```
frontend/src/
├── components/
│   ├── layout/        (Header, Footer, Nav)
│   ├── dashboard/     (Cards, Metrics, Feeds)
│   ├── modules/       (Feature-specific)
│   └── ui/            (Primitives: Button, Input, etc.)
├── lib/
│   ├── api/          (API client)
│   ├── hooks/        (Custom React hooks)
│   └── utils/        (Helpers, validators)
├── styles/
│   ├── tokens.css    (Design system)
│   └── globals.css
└── types/            (Shared types from backend)

backend/src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── accounts/
│   └── reports/
├── common/           (Guards, pipes, filters)
├── database/         (Prisma, migrations)
└── config/
```

## When to Use Agents
- **Explore agent**: Large codebase questions, search for patterns → Use for "quick" thoroughness
- **Implement work**: Use main agent with these guidelines
- **Context isolation**: Complex multi-step → Consider subagent

## File Operations
- **Single file**: Use `create_file` directly
- **Multiple files/edits**: Use `multi_replace_string_in_file` for efficiency
- **Batch context gathering**: Parallel reads, deduplicate results

## Session Memory
- Track: Current phase, blockers, decisions made
- Update: After each milestone (don't batch updates)
- Review: Before starting new phase

## Code Quality
- All functions must have TypeScript types
- Use Zod for API input validation
- Constants in `shared/` folder
- No magic strings; use enums/constants
- Tests: 80%+ coverage for APIs and utils

## Security Checklist (Every Phase)
- [ ] Input validation at entry points
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention (React escaping)
- [ ] CSRF tokens on forms
- [ ] Rate limiting on public endpoints
- [ ] Secrets in environment variables
- [ ] Audit logs for sensitive operations
