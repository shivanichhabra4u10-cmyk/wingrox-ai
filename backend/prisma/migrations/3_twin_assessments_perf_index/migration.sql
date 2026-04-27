-- Improves OTP verification lookup by matching filter + sort pattern.
CREATE INDEX IF NOT EXISTS "twin_assessments_email_status_createdAt_idx"
ON "twin_assessments" ("email", "status", "createdAt");
