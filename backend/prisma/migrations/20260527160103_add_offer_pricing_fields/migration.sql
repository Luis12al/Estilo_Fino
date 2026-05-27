/*
  Warnings:

  - You are about to drop the column `discount_amount` on the `offers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "offers" DROP COLUMN "discount_amount",
ADD COLUMN     "final_price" DECIMAL(10,2) DEFAULT 0,
ADD COLUMN     "original_price" DECIMAL(10,2) DEFAULT 0;
