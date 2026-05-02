-- CreateTable
CREATE TABLE "sim_runs" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "revenueK" DECIMAL(10,2) NOT NULL,
    "growthPct" DECIMAL(6,3) NOT NULL,
    "marginPct" DECIMAL(6,3) NOT NULL,
    "burnK" DECIMAL(10,2) NOT NULL,
    "cashK" DECIMAL(10,2) NOT NULL,
    "cac" DECIMAL(10,2) NOT NULL,
    "ltm" INTEGER NOT NULL,
    "horizonMonths" INTEGER NOT NULL,
    "outputs" JSONB NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sim_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sim_unlocks" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "email" TEXT,
    "paymentRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sim_unlocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sim_runs_sessionId_idx" ON "sim_runs"("sessionId");

-- CreateIndex
CREATE INDEX "sim_runs_sessionId_createdAt_idx" ON "sim_runs"("sessionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "sim_unlocks_sessionId_key" ON "sim_unlocks"("sessionId");

-- CreateIndex
CREATE INDEX "sim_unlocks_sessionId_idx" ON "sim_unlocks"("sessionId");
