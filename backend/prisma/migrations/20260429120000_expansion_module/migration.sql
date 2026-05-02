-- =============================================================
-- Global Expansion / Intelligence Engine — Layer II
-- =============================================================

-- CreateTable: expansion_countries
CREATE TABLE "expansion_countries" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flag" TEXT NOT NULL,
    "region" TEXT,
    "currency" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "population" DECIMAL(10,2) NOT NULL,
    "gdpUsdBn" DECIMAL(12,2) NOT NULL,
    "gdpGrowthPct" DECIMAL(5,2) NOT NULL,
    "tradeScore" INTEGER NOT NULL,
    "demandScore" INTEGER NOT NULL,
    "easeScore" INTEGER NOT NULL,
    "riskBand" TEXT NOT NULL,
    "regulatoryBand" TEXT NOT NULL,
    "costBand" TEXT NOT NULL,
    "tariffBand" TEXT NOT NULL,
    "ceta" BOOLEAN NOT NULL DEFAULT false,
    "industryFit" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expansion_countries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "expansion_countries_code_key" ON "expansion_countries"("code");
CREATE INDEX "expansion_countries_region_idx" ON "expansion_countries"("region");

-- CreateTable: expansion_assessments
CREATE TABLE "expansion_assessments" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "companyName" TEXT NOT NULL,
    "hqCountry" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "revenueBand" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "targetGeos" TEXT[] NOT NULL,
    "readinessScore" INTEGER NOT NULL,
    "marketReady" INTEGER NOT NULL,
    "financialReady" INTEGER NOT NULL,
    "gtmReady" INTEGER NOT NULL,
    "cluster" TEXT NOT NULL,
    "topCountries" JSONB NOT NULL,
    "revenueLowUsdM" DECIMAL(10,2) NOT NULL,
    "revenueBaseUsdM" DECIMAL(10,2) NOT NULL,
    "revenueHighUsdM" DECIMAL(10,2) NOT NULL,
    "risks" JSONB NOT NULL,
    "moves" JSONB NOT NULL,
    "report" JSONB NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expansion_assessments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "expansion_assessments_email_idx" ON "expansion_assessments"("email");
CREATE INDEX "expansion_assessments_industry_idx" ON "expansion_assessments"("industry");
CREATE INDEX "expansion_assessments_createdAt_idx" ON "expansion_assessments"("createdAt");
CREATE INDEX "expansion_assessments_industry_createdAt_idx" ON "expansion_assessments"("industry", "createdAt");

-- CreateTable: expansion_signals
CREATE TABLE "expansion_signals" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "apiLayer" TEXT NOT NULL,
    "apiLabel" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "geo" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "signalType" TEXT NOT NULL,
    "ageDays" INTEGER NOT NULL,
    "signal" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "metadata" JSONB,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expansion_signals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "expansion_signals_externalId_key" ON "expansion_signals"("externalId");
CREATE INDEX "expansion_signals_apiLayer_idx" ON "expansion_signals"("apiLayer");
CREATE INDEX "expansion_signals_industry_idx" ON "expansion_signals"("industry");
CREATE INDEX "expansion_signals_geo_idx" ON "expansion_signals"("geo");
CREATE INDEX "expansion_signals_priority_idx" ON "expansion_signals"("priority");
CREATE INDEX "expansion_signals_signalType_idx" ON "expansion_signals"("signalType");
CREATE INDEX "expansion_signals_publishedAt_idx" ON "expansion_signals"("publishedAt");
CREATE INDEX "expansion_signals_priority_publishedAt_idx" ON "expansion_signals"("priority", "publishedAt");

-- CreateTable: expansion_leads
CREATE TABLE "expansion_leads" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "assessmentId" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expansion_leads_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "expansion_leads_kind_idx" ON "expansion_leads"("kind");
CREATE INDEX "expansion_leads_status_idx" ON "expansion_leads"("status");
CREATE INDEX "expansion_leads_email_idx" ON "expansion_leads"("email");
CREATE INDEX "expansion_leads_createdAt_idx" ON "expansion_leads"("createdAt");
