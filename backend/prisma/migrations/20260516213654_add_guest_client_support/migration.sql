-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_client_id_fkey";

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "guest_name" VARCHAR(150),
ADD COLUMN     "guest_phone" VARCHAR(20),
ALTER COLUMN "client_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "appointments_guest_phone_idx" ON "appointments"("guest_phone");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
