-- CreateTable
CREATE TABLE "hub_saves" (
    "id" TEXT NOT NULL,
    "articleSlug" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hub_saves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hub_saves_sessionId_idx" ON "hub_saves"("sessionId");

-- CreateIndex
CREATE INDEX "hub_saves_articleSlug_idx" ON "hub_saves"("articleSlug");

-- CreateIndex
CREATE UNIQUE INDEX "hub_saves_articleSlug_sessionId_key" ON "hub_saves"("articleSlug", "sessionId");
