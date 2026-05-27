-- CreateEnum
CREATE TYPE "OfferType" AS ENUM ('PERMANENT', 'LIMITED_TIME');

-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "offer_type" "OfferType" NOT NULL DEFAULT 'PERMANENT',
ALTER COLUMN "valid_from" DROP NOT NULL,
ALTER COLUMN "valid_until" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "offers_is_active_idx" ON "offers"("is_active");

-- CreateIndex
CREATE INDEX "offers_offer_type_idx" ON "offers"("offer_type");
