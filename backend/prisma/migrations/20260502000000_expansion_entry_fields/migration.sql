-- Add entry model and capital budget to expansion assessments
ALTER TABLE "expansion_assessments"
  ADD COLUMN IF NOT EXISTS "entryModel"       TEXT    DEFAULT 'distributor',
  ADD COLUMN IF NOT EXISTS "entryCapitalUsdK" INTEGER DEFAULT 150;
