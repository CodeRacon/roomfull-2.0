ALTER TABLE "users"
  ADD COLUMN "is_demo" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "demo_expires_at" TIMESTAMP(3);
