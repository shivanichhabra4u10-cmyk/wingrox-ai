-- CreateTable
CREATE TABLE "eco_applications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "website" TEXT,
    "role" TEXT NOT NULL,
    "partnerType" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "stage" TEXT,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "ipAddress" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eco_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "eco_applications_email_idx" ON "eco_applications"("email");

-- CreateIndex
CREATE INDEX "eco_applications_status_idx" ON "eco_applications"("status");

-- CreateIndex
CREATE INDEX "eco_applications_partnerType_idx" ON "eco_applications"("partnerType");

-- CreateIndex
CREATE INDEX "eco_applications_createdAt_idx" ON "eco_applications"("createdAt");
