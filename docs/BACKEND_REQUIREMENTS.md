# WinGroX AI - Backend Requirements Specification
**Production-Ready Architecture & API Design**

---

## Executive Summary

WinGroX AI is a **Growth Intelligence Operating System** for founders. The backend must support 8 core feature modules, each with distinct data models, API patterns, and business logic. This document defines:

1. **Feature Names & Descriptions**
2. **Database Entities & Schema**
3. **API Endpoints Required**
4. **Real-Time & Streaming Requirements**
5. **Recommendations for Scale & Performance**

**Technology Stack:** NestJS + Express, PostgreSQL, Prisma ORM, JWT Auth, Zod validation, SSE for real-time, Redis for caching.

---

## 1. FEATURES OVERVIEW

### Layer I: Digital Twin Engine™ (Assessment & Profile)
**Feature Name:** `TwinAssessment` / `CompanyProfile`

**Purpose:** Questionnaire-based company diagnostic (77+ questions) that generates a twin score and capability baseline. Users answer adaptive questions reshaped by sector, stage, and intent.

**Key Workflows:**
- Start assessment
- Answer questions (1-by-1 or multi-question page)
- AI layer that identifies gaps in fixed questions
- Generate Twin Score (0–100)
- Save twin to database for future reference

---

### Layer II: Scale Navigator™ (Expansion Readiness)
**Feature Name:** `ExpansionReadiness` / `CountryRadar`

**Purpose:** Assess readiness to enter 48+ countries. Scores based on:
- Market attractiveness (GDP, growth, trade)
- Regulatory complexity (taxes, entity formation, compliance)
- GTM feasibility (distributor availability, local talent, cost)
- Company fit (capability match to market demands)

**Key Workflows:**
- Input company profile
- Select target countries (or get recommendations)
- Generate country opportunity dashboard with scoring, heatmaps, playbooks
- Export 90-day entry playbook
- Track readiness over time as inputs change

---

### Layer III: Match Intelligence™ (Ecosystem Matchmaking)
**Feature Name:** `PartnerMatch` / `MatchEngine`

**Purpose:** AI-scored matching of company profiles against 8,400+ ecosystem partners:
- Investors (Seed/Series A+)
- Distributors & resellers
- JV / strategic partners
- Enterprise customers
- Advisors & mentors
- Senior hires (CRO/VP)
- Accelerators / programmes
- Government / trade bodies

**Key Workflows:**
- User inputs company profile + intent + priorities
- System ranks matches (anonymised until Discovery Call booked)
- User books Discovery Call (30 min)
- After call: names, intros, data-room access unlock
- AI-generated match pool read ("Your profile resonates most with...")

---

### Layer IV: Intelligence Hub™ (Knowledge Base)
**Feature Name:** `PlaybookContent` / `MarketIntel`

**Purpose:** Personalised playbooks and market intelligence filtered through user's Digital Twin. Every piece of content:
- Is tagged (GTM, Expansion, Fundraising, Unit Economics, Leadership, Regulation)
- Links to user's specific context ("What This Means For You")
- Answers: what does this mean for my company, and what should I do?

**Key Workflows:**
- User filters by topic, content type, source
- Browse/search playbooks and market intel
- Save favorites
- AI-generated context cards relate content to user's profile
- Track engagement (views, saves, clicks)

---

### Layer V: Simulator Suite™ (Financial Modeling)
**Feature Name:** `GrowthSimulator` / `ScenarioModeler`

**Purpose:** Real-time multi-scenario financial projection engine. User adjusts levers (revenue, growth, margin, burn, cash, CAC, LTV, etc.) and sees outcomes:
- Top-line growth trajectory
- Bottom-line (profit/loss) trajectory
- Market expansion ROI
- Cash runway
- Fundraise timing recommendation
- Best/Base/Worst case scenarios

**Key Workflows:**
- User inputs baseline metrics (monthly revenue, growth %, margin, burn, cash, CAC, LTV)
- Selects scenario type (top-line, bottom-line, expansion, runway, fundraise, scenario planner)
- Adjusts sliders in real-time → all outputs recompute live (Canvas charts)
- Free tier: 2 iterations. Paid: unlimited.
- Export results as PDF

---

### Bonus 1: Global Expansion Intelligence Engine™
**Feature Name:** `IntelligenceEngine` / `ExpansionReporter`

**Purpose:** Free-to-premium intelligence reports. Free tier:
- Expansion readiness score
- Daily insights feed
- Industry opportunity radar
- Country snapshots (48+ markets)

Paid tier ($200k–2M per report):
- Full country opportunity dashboard
- Market entry playbook (90-day step-by-step)
- Revenue opportunity engine (projected revenue & ROI per market)
- Benchmark engine (company vs. peers)

**Key Workflows:**
- User inputs company context → system fuses 10 API layers
- Generates readiness score, top 3 countries, revenue projections, key risks, Next 3 Moves
- Displays in structured report with charts and AI interpretation
- Optionally upgrades to full playbook

---

### Bonus 2: Live Intelligence Layer™ (Real-Time Signal Feed)
**Feature Name:** `LiveSignals` / `IntelligenceFeed`

**Purpose:** Real-time, multi-variable signal feed fused from 10 data sources:
1. News & signals (GNews, Reuters, TechCrunch, etc.)
2. Global markets (World Bank, IMF, UN Comtrade, OECD)
3. Demand trends (Google Trends, Our World in Data, GitHub)
4. Company intel (OpenCorporates, Product Hunt)
5. Finance signals (Alpha Vantage, SEC EDGAR)
6. Trade & supply chain (UN Comtrade, MarineTraffic)
7. Talent & cost (Adzuna, REST Countries)
8. Country context (REST Countries, ExchangeRate)
9. RSS automation (Feedparser, RSS-to-JSON)
10. AI fusion layer (Claude, custom ML)

**Key Workflows:**
- Real-time signals stream in (refreshed every 15 min)
- User filters across dimensions: API layer, industry, country, priority, signal type, timeframe
- Each signal shows: "Signal" (what happened) + "Impact" (why it matters) + "Action" (what to do)
- User can drill down on any signal for details
- Premium users see full universe (1,200+ signals); free users see top 40

---

### Bonus 3: AI Advisor / Chatbot Widget
**Feature Name:** `ChatBot` / `AIAdvisor`

**Purpose:** Floating chat widget where user asks questions. AI responds with:
- Context from user's Digital Twin, assessments, and matches
- Sourced insights from content library
- Actionable next steps

**Questions handled:**
- "What should I do next?"
- "Which country first?"
- "Why are deals stalling?"
- "Where do we hire?"
- Custom free-text questions

---

## 2. DATABASE SCHEMA & ENTITIES

### Core Tables

#### `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  role VARCHAR(50) DEFAULT 'founder', -- founder, investor, accelerator, partner
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deletedAt TIMESTAMP NULL
);
```

#### `accounts`
```sql
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  companyName VARCHAR(255) NOT NULL,
  companyDescription TEXT,
  hqCountry VARCHAR(100),
  sector VARCHAR(100), -- Industrial, SaaS, Healthcare, Fintech, etc.
  stage VARCHAR(50), -- Pre-seed, Seed, Series A, Series B, etc.
  annualRevenueUSD DECIMAL(12,2),
  businessModel VARCHAR(100), -- B2B, B2C, B2B2C, Marketplace, D2C
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId) -- one account per user
);
```

#### `twin_assessments`
```sql
CREATE TABLE twin_assessments (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accountId INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  twinScore INT DEFAULT 0, -- 0-100
  clusterStage VARCHAR(100), -- Foundation, Preparation, Expansion-Ready, Scale-Ready
  readinessDimensions JSONB, -- {demand: 58, strategy: 62, competition: 60, economics: 66, customer: 59, execution: 70}
  questionnaire JSONB, -- Full Q&A responses for audit trail
  completedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Composite index for query performance
CREATE INDEX idx_twin_userId_createdAt ON twin_assessments(userId, createdAt DESC);
```

#### `expansion_readiness`
```sql
CREATE TABLE expansion_readiness (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  countryCode VARCHAR(2) NOT NULL, -- ISO alpha-2: DE, UK, US, SG, etc.
  countryScore INT, -- 0-100 opportunity score
  marketAttractivenessScore INT, -- GDP, growth, trade
  regulatoryComplexityScore INT, -- Ease of entity formation, compliance burden
  gtmFeasibilityScore INT, -- Distributor availability, talent, cost
  companyFitScore INT, -- How well company matches market needs
  recommendedEntryModel VARCHAR(50), -- distributor-led, direct, JV, licensing
  estimatedEntryCapital DECIMAL(12,2),
  estimatedTimeToFirstDeal INT, -- In months
  projectedY2Revenue DECIMAL(12,2),
  riskLevel VARCHAR(50), -- Low, Medium, High
  regulatoryNotes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, countryCode)
);
```

#### `partner_matches`
```sql
CREATE TABLE partner_matches (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matchRunId UUID NOT NULL, -- Groups matches from single run
  partnerType VARCHAR(50), -- investor, distributor, jv, customer, advisor, hire, accel, gov
  partnerName VARCHAR(255),
  partnerCountry VARCHAR(2),
  partnerProfile JSONB, -- {website, revenue, founded, focus_sectors, past_deals, etc.}
  anonymisedUntil TIMESTAMP, -- null if already unlocked
  matchScore INT, -- 0-100 AI compatibility score
  matchDimensions JSONB, -- {sector_fit, geography_fit, stage_fit, etc.}
  discoveryCallBooked BOOLEAN DEFAULT FALSE,
  discoveryCallDate TIMESTAMP,
  namesUnlockedAt TIMESTAMP,
  dataRoomAccessGrantedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, matchRunId, partnerName) -- Prevent duplicates in a run
);

CREATE INDEX idx_matches_userId_matchScore ON partner_matches(userId, matchScore DESC);
```

#### `playbook_content`
```sql
CREATE TABLE playbook_content (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  contentType VARCHAR(50), -- playbook, market_intel, benchmark, case_study
  topic VARCHAR(100), -- GTM, Expansion, Fundraising, UnitEconomics, Leadership, Regulation
  minReadTimeMinutes INT,
  body TEXT, -- Markdown
  source VARCHAR(100), -- WinGroX Research, Partner Contributions, External Syndicated
  sector JSON, -- Which sectors this applies to: {SaaS: true, Industrial: false, ...}
  stage JSON, -- Which stages: {Seed: true, SeriesA: true, ...}
  targetGeographies JSON, -- {UAE: true, US: true, ...}
  whatThisMeansTemplate TEXT, -- AI-generated per-user contextualization
  publishedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_playbook_topic_sector ON playbook_content(topic, (sector->>'SaaS'));
```

#### `playbook_user_engagement`
```sql
CREATE TABLE playbook_user_engagement (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  playbookId INT NOT NULL REFERENCES playbook_content(id) ON DELETE CASCADE,
  viewedAt TIMESTAMP,
  savedAt TIMESTAMP,
  clickedAt TIMESTAMP,
  completedAt TIMESTAMP,
  timeSpentSeconds INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, playbookId)
);
```

#### `growth_simulations`
```sql
CREATE TABLE growth_simulations (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  simulationName VARCHAR(255),
  scenarioType VARCHAR(50), -- topline, bottomline, expansion, runway, fundraise, scenario_planner
  inputs JSONB, -- {revenue_usd: 80000, growth_pct: 8, margin_pct: 68, burn_usd: 120000, ...}
  outputs JSONB, -- {endRevenue, cumulativeRevenue, breakEvenMonth, ltv_cac_ratio, ...}
  chartData JSONB, -- Raw chart.js-ready data for frontend rendering
  iterationCount INT DEFAULT 0, -- Track usage for paywall
  savedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_simulation_userId_createdAt ON growth_simulations(userId, createdAt DESC);
```

#### `intelligence_reports`
```sql
CREATE TABLE intelligence_reports (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reportType VARCHAR(50), -- free_readiness, paid_country_dashboard, premium_playbook
  status VARCHAR(50), -- generating, completed, archived
  generationStartedAt TIMESTAMP,
  completedAt TIMESTAMP,
  company JSONB, -- {name, hq, revenue, industry, ...}
  targetCountries JSON, -- Top 3 recommended countries
  readinessScore INT, -- Overall expansion readiness
  marketReady INT, -- Market-specific dimension
  financialReady INT, -- Financial-specific dimension
  gtmReady INT, -- GTM-specific dimension
  report JSONB, -- Full report structure: {headline, countries, risks, moves, projections, ...}
  pdfUrl VARCHAR(255), -- S3 URL if exported
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_userId_reportType ON intelligence_reports(userId, reportType);
```

#### `live_signals`
```sql
CREATE TABLE live_signals (
  id SERIAL PRIMARY KEY,
  externalId VARCHAR(255) UNIQUE,
  dataLayer VARCHAR(50), -- news, markets, trends, trade, finance, company, talent, country, risk, etc.
  dataLayerLabel VARCHAR(50), -- GNEWS, WORLD BANK, GOOGLE TRENDS, etc.
  industry VARCHAR(100), -- FMCG, SaaS, Healthcare, etc. or 'global'
  country VARCHAR(2), -- ISO code or 'global'
  priority VARCHAR(50), -- urgent, high, monitor
  signalType VARCHAR(50), -- opportunity, risk, regulatory, demand, competitive
  headline TEXT,
  impact TEXT,
  recommendedAction TEXT,
  source VARCHAR(255),
  timeAgeInDays INT,
  relevanceScore INT, -- 0-100 relevance to various industries/geos
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP -- TTL for signal relevance
);

-- GIN index for full-text search + filtering
CREATE INDEX idx_signal_industry_country_priority ON live_signals
  USING GIN ((industry || country || priority)::text);
```

#### `user_signal_preferences`
```sql
CREATE TABLE user_signal_preferences (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dataLayerFilter JSON, -- {all: true} or {news: true, markets: true, ...}
  industryFilter JSON, -- Selected industries
  countryFilter JSON, -- Selected countries
  priorityFilter JSON, -- urgent, high, monitor
  signalTypeFilter JSON, -- opportunity, risk, regulatory, etc.
  timeframeFilter VARCHAR(50), -- 7d, 30d, 90d
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId)
);
```

#### `reports` (Aggregated business analytics)
```sql
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  reportType VARCHAR(50), -- twin_summary, expansion_summary, match_summary, revenue_summary
  aggregationDate DATE,
  data JSONB, -- Aggregated metrics: {totalAssessments, avgTwinScore, totalMatches, etc.}
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. API ENDPOINTS

### **Auth Module** (`/auth`)

| Method | Endpoint | Auth | Payload | Response | Notes |
|--------|----------|------|---------|----------|-------|
| POST | `/auth/register` | None | `{email, password, firstName, lastName}` | `{userId, token, refreshToken}` | Zod validation |
| POST | `/auth/login` | None | `{email, password}` | `{userId, token, refreshToken}` | JWT generation |
| POST | `/auth/refresh-token` | RefreshToken | `{refreshToken}` | `{token, refreshToken}` | Rotation |
| POST | `/auth/logout` | JwtGuard | `{}` | `{success: true}` | Invalidate session |

---

### **Accounts Module** (`/accounts`)

| Method | Endpoint | Auth | Payload | Response | Notes |
|--------|----------|------|---------|----------|-------|
| POST | `/accounts/create` | JwtGuard | `{companyName, hqCountry, sector, stage, revenue, model, description}` | `{accountId, ...}` | Zod validation |
| GET | `/accounts/me` | JwtGuard | `{}` | `{id, companyName, ...}` | Current user account |
| PUT | `/accounts/me` | JwtGuard | `{...fields}` | `{id, ...}` | Partial update |
| GET | `/accounts/{id}` | JwtGuard | `{}` | `{id, companyName, ...}` | Account detail |

---

### **Twin Assessment Module** (`/twin`)

| Method | Endpoint | Auth | Payload | Response | Notes |
|--------|----------|------|---------|----------|-------|
| POST | `/twin/start` | JwtGuard | `{accountId}` | `{assessmentId, firstQuestion}` | Initiate assessment |
| POST | `/twin/{assessmentId}/answer` | JwtGuard | `{questionId, answer}` | `{nextQuestion}` | 1-by-1 or batch |
| POST | `/twin/{assessmentId}/submit` | JwtGuard | `{}` | `{assessmentId, twinScore, clusterStage, dimensions}` | Finalize assessment |
| GET | `/twin/{assessmentId}` | JwtGuard | `{}` | `{twinScore, dimensions, questionnaire, ...}` | Assessment detail |
| GET | `/twin/latest` | JwtGuard | `{}` | `{twinScore, ...}` | Current user's latest |
| GET | `/twin/history` | JwtGuard | `{limit, offset}` | `[{id, twinScore, createdAt}, ...]` | Paginated history |

---

### **Expansion Readiness Module** (`/expansion`)

| Method | Endpoint | Auth | Payload | Response | Notes |
|--------|----------|------|---------|----------|-------|
| POST | `/expansion/assess` | JwtGuard | `{accountId, targetCountries: [code, ...]}` | `{readinessScores, playbooks}` | Run expansion assessment |
| GET | `/expansion/country/{countryCode}` | JwtGuard | `{}` | `{countryScore, marketAttractive, regulatory, gtm, riskLevel}` | Country-specific scores |
| GET | `/expansion/countries` | JwtGuard | `{limit}` | `[{countryCode, countryScore, ...}, ...]` | All assessed countries |
| GET | `/expansion/playbook/{countryCode}` | JwtGuard | `{}` | `{90daySteps, distributors, ...}` | Country entry playbook |
| POST | `/expansion/track-progress` | JwtGuard | `{countryCode, milestone, status}` | `{progressId}` | Track execution |

---

### **Partner Matching Module** (`/match`)

| Method | Endpoint | Auth | Payload | Response | Notes |
|--------|----------|------|---------|----------|-------|
| POST | `/match/run` | JwtGuard | `{companyProfile, intent, priorities, notes}` | `{matchRunId}` | Initiate matching |
| GET | `/match/run/{matchRunId}/progress` | JwtGuard | `{}` | `{progress: 0-100, status}` | Real-time progress (SSE) |
| GET | `/match/run/{matchRunId}/results` | JwtGuard | `{limit, offset}` | `[{matchScore, anonymised}, ...]` | Paginated anonymised matches |
| GET | `/match/{matchId}` | JwtGuard | `{}` | `{partnerName, profile, matchDimensions}` | Full match detail (names visible only post-call) |
| POST | `/match/{matchId}/book-discovery-call` | JwtGuard | `{preferredTime, notes}` | `{callBooked: true}` | Schedule 30-min call |
| POST | `/match/{matchId}/confirm-call-done` | JwtGuard | `{callNotes}` | `{namesUnlocked: true}` | Unlock names post-call |
| GET | `/match/my-matches` | JwtGuard | `{status, limit, offset}` | `[{id, partnerType, matchScore, ...}, ...]` | User's match history |

---

### **Intelligence Hub Module** (`/hub`)

| Method | Endpoint | Auth | Payload | Response | Notes |
|--------|----------|------|---------|----------|-------|
| GET | `/hub/feed` | JwtGuard | `{topic, contentType, source, limit, offset}` | `[{id, title, topic, whatThisMeansForYou}, ...]` | Personalised feed |
| GET | `/hub/playbook/{playbookId}` | JwtGuard | `{}` | `{id, title, body, whatThisMeansForYou}` | Full playbook + context |
| POST | `/hub/playbook/{playbookId}/save` | JwtGuard | `{}` | `{savedAt}` | Save for later |
| POST | `/hub/playbook/{playbookId}/engage` | JwtGuard | `{action: viewed\|clicked\|completed, timeSpent}` | `{logged: true}` | Track engagement |
| GET | `/hub/saved` | JwtGuard | `{limit, offset}` | `[{id, title, savedAt}, ...]` | User's saved content |
| GET | `/hub/trending` | None | `{limit}` | `[{id, title, views}, ...]` | Public trending content |

---

### **Growth Simulator Module** (`/sim`)

| Method | Endpoint | Auth | Payload | Response | Notes |
|--------|----------|------|---------|----------|-------|
| POST | `/sim/create` | JwtGuard | `{scenarioType, simulationName}` | `{simulationId, inputs: {}}` | New scenario |
| PUT | `/sim/{simulationId}/update` | JwtGuard | `{inputs: {...updated fields}}` | `{outputs: {...}}` | Update inputs → recompute |
| GET | `/sim/{simulationId}` | JwtGuard | `{}` | `{inputs, outputs, chartData}` | Full scenario detail |
| GET | `/sim/list` | JwtGuard | `{limit, offset}` | `[{id, simulationName, createdAt}, ...]` | User's scenarios |
| POST | `/sim/{simulationId}/export-pdf` | JwtGuard | `{}` | `{pdfUrl, expiresIn}` | Generate PDF (S3) |
| POST | `/sim/check-iteration-limit` | JwtGuard | `{}` | `{remainingIterations}` | Check free tier limit |

---

### **Intelligence Engine Module** (`/intel`)

| Method | Endpoint | Auth | Payload | Response | Notes |
|--------|----------|------|---------|----------|-------|
| POST | `/intel/generate-report` | JwtGuard | `{company, industry, revenue, targetCountries, goal}` | `{reportId}` | Async report generation |
| GET | `/intel/report/{reportId}/progress` | JwtGuard | `{}` | `{progress: 0-100, status}` | Real-time progress (SSE) |
| GET | `/intel/report/{reportId}` | JwtGuard | `{}` | `{readinessScore, topCountries, risks, projections, moves}` | Full report |
| POST | `/intel/report/{reportId}/unlock-playbook` | JwtGuard | `{paymentToken}` | `{playbookUrl}` | Upgrade to playbook |
| GET | `/intel/sample-report` | None | `{}` | `{pdfUrl}` | Demo report (email capture) |

---

### **Live Signals Module** (`/signals`)

| Method | Endpoint | Auth | Payload | Response | Notes |
|--------|----------|------|---------|----------|-------|
| GET | `/signals/feed` | JwtGuard | `{api, industry, country, priority, type, timeframe, sort, limit, offset}` | `[{id, headline, impact, action, ...}, ...]` | Filtered signal feed |
| GET | `/signals/{signalId}` | JwtGuard | `{}` | `{id, headline, impact, action, dataSource, fullDetails}` | Signal detail |
| POST | `/signals/preferences` | JwtGuard | `{dataLayerFilter, industryFilter, countryFilter, priorityFilter, signalTypeFilter, timeframeFilter}` | `{saved: true}` | Save filter prefs |
| GET | `/signals/preferences` | JwtGuard | `{}` | `{...filters}` | Retrieve saved filters |
| GET | `/signals/stream` | JwtGuard | `{}` | SSE stream | Real-time signal stream |

---

### **Dashboard Module** (`/dashboard`)

| Method | Endpoint | Auth | Payload | Response | Notes |
|--------|----------|------|---------|----------|-------|
| GET | `/dashboard/overview` | JwtGuard | `{}` | `{twinScore, expansionReadiness, matchCount, pipeline, constraints}` | Summary metrics |
| GET | `/dashboard/insights-feed` | JwtGuard | `{limit, offset}` | `[{type, title, desc, timestamp}, ...]` | Personalised insights |
| GET | `/dashboard/recommended-actions` | JwtGuard | `{}` | `[{action, priority, reason}, ...]` | AI-generated next steps |
| GET | `/dashboard/readiness-dimensions` | JwtGuard | `{}` | `{demand, strategy, competition, economics, customer, execution}` | Radar chart data |

---

### **Reports Module** (`/reports`) — *Analytics & Aggregation*

| Method | Endpoint | Auth | Payload | Response | Notes |
|--------|----------|------|---------|----------|-------|
| GET | `/reports/summary` | AdminOnly | `{reportType, dateRange}` | `{aggregated metrics}` | Platform-wide summary |
| GET | `/reports/user-activity` | AdminOnly | `{userId, dateRange}` | `{assessments, matches, logins}` | User activity log |
| POST | `/reports/export-csv` | AdminOnly | `{reportType, dateRange}` | `{csvUrl}` | Export aggregated data |

---

## 4. REAL-TIME & STREAMING REQUIREMENTS

### Server-Sent Events (SSE) Streams

1. **Match Execution Progress** (`/match/run/{matchRunId}/progress`)
   - Stream real-time completion % as AI evaluates 8,400+ partners
   - Update every 2–5 seconds
   - Push status messages: "Analysing compatibility", "Filtering by geography", "Computing scores", etc.

2. **Intelligence Report Generation** (`/intel/report/{reportId}/progress`)
   - Stream progress as system:
     - Fuses 10 API layers
     - Pulls World Bank, IMF, UN Comtrade data
     - Scans Google Trends
     - Computes readiness scores
     - Generates AI recommendations
   - Update every 3–8 seconds
   - Final report auto-pushes to frontend when ready

3. **Live Signal Feed** (`/signals/stream`)
   - Continuous stream of new signals as they arrive
   - Refresh every 15 minutes from source APIs
   - Push new signal objects to subscribed clients
   - Allow filtering: only send signals matching user's saved preferences

---

## 5. DATABASE SCHEMA & INDEXING STRATEGY

### Performance Optimizations

#### Composite Indexes (Priority)
```sql
-- Twin assessments: query by user + date range
CREATE INDEX idx_twin_userId_createdAt 
  ON twin_assessments(userId, createdAt DESC);

-- Expansion readiness: query by user + country
CREATE INDEX idx_expansion_userId_countryCode 
  ON expansion_readiness(userId, countryCode);

-- Partner matches: query by user + match score (sorting)
CREATE INDEX idx_partner_matches_userId_score 
  ON partner_matches(userId, matchScore DESC);

-- Playbook content: query by topic + sector
CREATE INDEX idx_playbook_topic_sector 
  ON playbook_content(topic, (sector->>'SaaS'));

-- Live signals: multi-field filtering (GIN for JSONB)
CREATE INDEX idx_signal_filters_gin 
  USING GIN (
    (dataLayer || '|' || industry || '|' || country || '|' || priority)::text
  );

-- Simulation history: query by user + date
CREATE INDEX idx_simulation_userId_createdAt 
  ON growth_simulations(userId, createdAt DESC);

-- Intelligence reports: query by user + report type
CREATE INDEX idx_reports_userId_reportType 
  ON intelligence_reports(userId, reportType);
```

#### Full-Text Search (Optional, for Playbook Search)
```sql
-- Add tsvector column for full-text search
ALTER TABLE playbook_content ADD COLUMN searchVector tsvector;

-- Index for fast FTS
CREATE INDEX idx_playbook_fts 
  ON playbook_content USING gin(searchVector);

-- Trigger to auto-update on insert/update
CREATE TRIGGER update_playbook_search_vector BEFORE INSERT OR UPDATE
  ON playbook_content FOR EACH ROW
  EXECUTE FUNCTION tsvector_update_trigger(searchVector, 'pg_catalog.english', title, body);
```

#### Materialized Views (for Aggregations)
```sql
-- Real-time dashboard metrics (refreshed every 5 min)
CREATE MATERIALIZED VIEW dashboard_metrics_cache AS
SELECT 
  DATE_TRUNC('hour', createdAt) as period,
  COUNT(DISTINCT userId) as active_users,
  AVG(twinScore) as avg_twin_score,
  COUNT(*) as total_assessments
FROM twin_assessments
GROUP BY DATE_TRUNC('hour', createdAt);

CREATE INDEX idx_dashboard_metrics_period ON dashboard_metrics_cache(period DESC);

-- Refresh periodically (via cron job or NestJS schedule)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_metrics_cache;
```

---

## 6. RECOMMENDED IMPROVEMENTS & ARCHITECTURE

### 6.1 Scalability

#### **API Rate Limiting**
- Implement Redis-based rate limiting (5 requests/sec per user)
- Endpoint-specific limits for expensive ops (match runs, report generation)

#### **Caching Strategy**
```typescript
// Cache layers:
// 1. Browser cache (static playbooks, country data)
// 2. Redis cache (user profile, match results, signal feed)
// 3. Database query optimization (indexes + materialized views)

// TTL by data type:
// - User profile: 5 min
// - Match results: 1 hour
// - Playbook content: 24 hours
// - Live signals: 15 min (refresh from source)
// - Intelligence reports: 7 days
```

#### **Database Connection Pooling**
```typescript
// Use Prisma's connection pooling (already built-in)
// PrismaClient({ datasources: { db: { url: DATABASE_URL } } })
// Max connections: 10–20 per region
// Connection timeout: 5s
```

#### **CDN for Static Assets**
- CloudFront / Vercel Edge for playbook PDFs, sample reports
- S3 for generated exports (simulations, reports)

---

### 6.2 Real-Time & AI Integration

#### **Asynchronous Task Queue** (Bull + Redis)
For expensive/long-running operations:
```typescript
// Queues:
1. match-run-queue (8,400+ partners scored)
2. report-generation-queue (10 API layers fused)
3. signal-ingestion-queue (external APIs polled every 15 min)
4. pdf-export-queue (chart rendering + PDF generation)

// Retry policy: exponential backoff (3x, 5m, 15m, 1h)
// Timeout: 30 min per job
// Parallelism: 2–4 workers per queue
```

#### **WebSocket for Live Updates** (Optional, instead of SSE)
```typescript
// If real-time interactivity needed beyond SSE:
- Socket.io or ws library
- Namespace per feature (match, intel, signals)
- Rooms per userId + reportId
- Broadcast score updates, signal arrivals
```

---

### 6.3 Security & Compliance

#### **Data Privacy**
- Anonymise partner data until Discovery Call booked
- GDPR: implement data export / deletion endpoints
- Encrypt sensitive fields (CAC, LTV, proprietary financials) at rest

#### **API Security**
```typescript
// - JWT HS256 or RS256 (prefer RS256 for multi-service)
// - Refresh token rotation (invalidate old token after rotation)
// - CORS whitelist (frontend domains only)
// - Helmet.js for security headers
// - Rate limit: 100 req/min per IP (unauthenticated), 1000 req/min per user (authenticated)
```

#### **Audit Logging**
```typescript
// Log all mutations:
// - User login/logout
// - Assessment created/updated
// - Match run initiated
// - Report generated
// - Settings changed

// Retention: 90 days
// Destination: CloudWatch / datadog or local PostgreSQL audit table
```

---

### 6.4 Monitoring & Observability

#### **Application Monitoring**
```typescript
// Metrics to track:
1. API response time (p50, p95, p99)
2. Queue job completion rate
3. Database query performance
4. SSE connection count
5. Match algorithm accuracy (match conversion rate)
6. Feature adoption (assessments/day, matches/day, reports/day)

// Tools: DataDog, New Relic, Prometheus + Grafana
```

#### **Error Handling & Alerting**
```typescript
// - All API errors logged with request context
// - 500 errors alert via Slack to on-call engineer
// - Queue job failures trigger alert after 3 retries
// - Database connection failures alert immediately
```

---

### 6.5 Testing & Quality

#### **Unit Tests** (Jest)
- Business logic: Twin scoring, match ranking, report generation
- Utility functions: Data transformation, validation
- Target: >70% code coverage

#### **Integration Tests**
- Full API flows: register → create account → start assessment → submit
- Match run end-to-end (mocked partner DB)
- Report generation end-to-end (mocked external APIs)

#### **Load Testing** (k6 or Apache JMeter)
- 1,000 concurrent users
- Match run: must complete within 60 seconds
- Report generation: must complete within 120 seconds
- API endpoints: p99 latency <2 seconds

---

### 6.6 Deployment & DevOps

#### **CI/CD Pipeline**
```yaml
# GitHub Actions
1. Lint (ESLint + Prettier)
2. Unit tests
3. Build Docker image
4. Push to ECR
5. Deploy to staging (ECS / Kubernetes)
6. Run integration tests
7. Deploy to production (blue-green or canary)
```

#### **Containerization**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

#### **Infrastructure** (AWS or GCP)
- **Compute:** ECS Fargate or EKS for auto-scaling
- **Database:** RDS PostgreSQL (Multi-AZ, automated backups)
- **Cache:** ElastiCache Redis
- **Queue:** SQS or RabbitMQ
- **Storage:** S3 for PDFs, exports
- **DNS:** Route53
- **Monitoring:** CloudWatch, DataDog

---

## 7. API PAGINATION & FILTERING PATTERNS

### Standard Pagination
```typescript
// All list endpoints support:
GET /endpoint?limit=20&offset=0

// Response:
{
  data: [...],
  pagination: {
    limit: 20,
    offset: 0,
    total: 156,
    hasMore: true
  }
}
```

### Sorting
```typescript
GET /endpoint?sort=-createdAt,+matchScore
// - prefix = descending
// + prefix = ascending
```

### Filtering (Multi-dimensional)
```typescript
GET /signals/feed?api=news&industry=SaaS&country=US&priority=urgent&type=opportunity&timeframe=7d

// All filters are AND-ed together
// Empty filter = no constraint (all values)
```

---

## 8. ERROR HANDLING & HTTP STATUS CODES

| Code | Scenario | Example |
|------|----------|---------|
| 200 | Success | `GET /accounts/me` |
| 201 | Created | `POST /twin/start` → new assessment |
| 204 | No content | `DELETE /match/{id}` |
| 400 | Bad request (validation) | Missing required field, invalid type |
| 401 | Unauthorized | Missing/expired JWT |
| 403 | Forbidden | User lacks role/permission |
| 404 | Not found | Assessment ID doesn't exist |
| 409 | Conflict | Duplicate match run in progress |
| 422 | Unprocessable entity | Zod validation error |
| 429 | Rate limited | Too many requests |
| 500 | Server error | Database connection failure |
| 503 | Service unavailable | Queue system down |

---

## 9. NEXT STEPS & PRIORITY

### Phase 1 (Weeks 1–4): MVP Backend
1. ✅ Auth (register, login, JWT)
2. ✅ Accounts (create, retrieve, update)
3. ✅ Twin Assessment (full flow)
4. ✅ Dashboard (basic metrics)
5. ✅ Reports (aggregation queries)

### Phase 2 (Weeks 5–8): Feature Expansion
1. Expansion Readiness (scoring, playbooks)
2. Partner Matching (AI scoring, Discovery Call booking)
3. Simulators (multi-scenario engine)
4. Growth + test coverage

### Phase 3 (Weeks 9–12): Intelligence & Real-Time
1. Intelligence Hub (playbook content, engagement)
2. Live Signals (ingestion, filtering, SSE)
3. Intelligence Reports (multi-layer generation)
4. Monitoring & observability

### Phase 4+ (Ongoing): Scale & Optimize
1. Performance tuning (DB indexes, caching, CDN)
2. Load testing & auto-scaling
3. Advanced analytics (cohort analysis, retention)
4. Compliance & security audit

---

## 10. OPENAPI / SWAGGER SPEC

**Location:** `/docs/openapi.yaml` or `/api/v1/docs` (Swagger UI)

**Coverage:** All 60+ endpoints documented with:
- Request/response schemas (Zod inferred)
- Required auth (JwtGuard, RolesGuard)
- Examples for each scenario
- Error codes documented per endpoint

---

## Summary

**Total Entities:** 12 core + 4 reference tables = **16 tables**

**Total API Endpoints:** 60+

**Real-Time Streams:** 3 (match progress, report progress, signal feed)

**Key Dependencies:** NestJS, Prisma, PostgreSQL, Redis, Bull, Zod, JWT, Helmet, Swagger

**Estimated Backend Dev Time:** 10–14 weeks (MVP → production-ready)

---

**Document Version:** 1.0  
**Last Updated:** 2025-02-XX  
**Maintained By:** Backend Team  
