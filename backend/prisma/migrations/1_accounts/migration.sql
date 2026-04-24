CREATE TABLE "accounts" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "legalName" TEXT,
  "website" TEXT,
  "country" TEXT NOT NULL,
  "industry" TEXT NOT NULL,
  "stage" TEXT NOT NULL,
  "annualRevenueUsd" DECIMAL(14,2),
  "description" TEXT,
  "ownerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "accounts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE CASCADE
);

CREATE INDEX "accounts_ownerId_idx" ON "accounts"("ownerId");
CREATE INDEX "accounts_country_idx" ON "accounts"("country");
CREATE INDEX "accounts_industry_idx" ON "accounts"("industry");
