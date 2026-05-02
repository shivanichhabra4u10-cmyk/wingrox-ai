-- CreateTable
CREATE TABLE "match_sessions" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "revenue" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "intent" TEXT[],
    "geos" TEXT[],
    "priorities" TEXT[],
    "matchCount" INTEGER NOT NULL,
    "aiRead" TEXT NOT NULL,
    "geoDistribution" JSONB NOT NULL,
    "typeBreakdown" JSONB NOT NULL,
    "topMatches" JSONB NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_discovery_calls" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "preferredTime" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_discovery_calls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "match_sessions_createdAt_idx" ON "match_sessions"("createdAt");

-- CreateIndex
CREATE INDEX "match_sessions_country_idx" ON "match_sessions"("country");

-- CreateIndex
CREATE INDEX "match_sessions_sector_idx" ON "match_sessions"("sector");

-- CreateIndex
CREATE INDEX "match_discovery_calls_sessionId_idx" ON "match_discovery_calls"("sessionId");

-- CreateIndex
CREATE INDEX "match_discovery_calls_email_idx" ON "match_discovery_calls"("email");

-- CreateIndex
CREATE INDEX "match_discovery_calls_status_idx" ON "match_discovery_calls"("status");

-- CreateIndex
CREATE INDEX "match_discovery_calls_createdAt_idx" ON "match_discovery_calls"("createdAt");

-- AddForeignKey
ALTER TABLE "match_discovery_calls" ADD CONSTRAINT "match_discovery_calls_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "match_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
