-- Accelerates report filtering on company JSON fields (country, industry, stage).
CREATE INDEX IF NOT EXISTS "twin_assessments_company_gin_idx"
ON "twin_assessments"
USING GIN ("company");
