-- CreateEnum
CREATE TYPE "contact_request_type" AS ENUM ('QUESTION', 'FEEDBACK', 'CRITICISM');

-- CreateTable
CREATE TABLE "contact_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "contact_request_type" NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_requests_read_created_idx" ON "contact_requests"("is_read", "created_at");

-- CreateIndex
CREATE INDEX "contact_requests_type_created_idx" ON "contact_requests"("type", "created_at");

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
