-- CreateTable
CREATE TABLE "space_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "space_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "opens_at" TEXT NOT NULL,
    "closes_at" TEXT NOT NULL,
    "space_type_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "space_types_name_key" ON "space_types"("name");

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_space_type_id_fkey" FOREIGN KEY ("space_type_id") REFERENCES "space_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
