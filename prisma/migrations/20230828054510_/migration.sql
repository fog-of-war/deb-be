/*
  Warnings:

  - You are about to drop the column `place_address_id` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_place_address_id_fkey";

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "place_address_id",
ADD COLUMN     "place_address" TEXT;

-- DropTable
DROP TABLE "Address";
