-- Remove per-space opening hours. Source of truth is global opening hours.
ALTER TABLE "spaces"
  DROP COLUMN "opens_at",
  DROP COLUMN "closes_at";
