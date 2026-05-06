-- Big-Bang reset to Area + UnitType + BookableUnit model

-- Remove old booking structure first (depends on spaces)
DROP TABLE IF EXISTS "bookings";
DROP TYPE IF EXISTS "booking_status";

-- Remove old space model
DROP TABLE IF EXISTS "spaces";
DROP TABLE IF EXISTS "space_types";

-- Create booking status enum
CREATE TYPE "booking_status" AS ENUM ('active', 'cancelled');

-- Create unit type enum
CREATE TYPE "UnitTypeName" AS ENUM ('HOT_DESK', 'BOOTH', 'TEAM_ROOM');

CREATE TABLE "areas" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "areas_name_key" ON "areas"("name");

CREATE TABLE "unit_types" (
  "id" TEXT NOT NULL,
  "name" "UnitTypeName" NOT NULL,
  "min_duration_minutes" INTEGER NOT NULL,
  "max_duration_minutes" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "unit_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "unit_types_name_key" ON "unit_types"("name");

CREATE TABLE "bookable_units" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "unit_type_id" TEXT NOT NULL,
  "area_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "bookable_units_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bookable_units_area_type_order_idx"
  ON "bookable_units"("area_id", "unit_type_id", "display_order");

ALTER TABLE "bookable_units"
  ADD CONSTRAINT "bookable_units_unit_type_id_fkey"
  FOREIGN KEY ("unit_type_id") REFERENCES "unit_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookable_units"
  ADD CONSTRAINT "bookable_units_area_id_fkey"
  FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "bookings" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "unit_id" TEXT NOT NULL,
  "start_time" TIMESTAMP(3) NOT NULL,
  "end_time" TIMESTAMP(3) NOT NULL,
  "status" "booking_status" NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "bookings_unit_status_time_idx"
  ON "bookings"("unit_id", "status", "start_time", "end_time");

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_no_active_overlap_excl"
  EXCLUDE USING GIST (
    "unit_id" WITH =,
    tsrange("start_time", "end_time", '[)') WITH &&
  )
  WHERE ("status" = 'active');

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_unit_id_fkey"
  FOREIGN KEY ("unit_id") REFERENCES "bookable_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
