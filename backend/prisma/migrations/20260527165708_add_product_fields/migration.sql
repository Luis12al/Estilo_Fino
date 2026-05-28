-- CreateEnum
CREATE TYPE "product_category" AS ENUM ('HAIR', 'BEARD', 'SKIN', 'ACCESSORIES', 'OTHER');

-- CreateEnum
CREATE TYPE "product_availability" AS ENUM ('PERMANENT', 'LIMITED');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "availability_type" "product_availability" NOT NULL DEFAULT 'PERMANENT',
ADD COLUMN     "category" "product_category" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "deleted_at" TIMESTAMPTZ(6),
ADD COLUMN     "limited_until" TIMESTAMPTZ(6);

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_availability_type_idx" ON "products"("availability_type");

-- CreateIndex
CREATE INDEX "products_deleted_at_idx" ON "products"("deleted_at");
