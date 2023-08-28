/*
  Warnings:

  - You are about to drop the column `place_address` on the `Place` table. All the data in the column will be lost.
  - Added the required column `place_address_id` to the `Place` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Place" DROP COLUMN "place_address",
ADD COLUMN     "place_address_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Address" (
    "address_id" SERIAL NOT NULL,
    "address_gu" TEXT NOT NULL,
    "address_other" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("address_id")
);

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_place_address_id_fkey" FOREIGN KEY ("place_address_id") REFERENCES "Address"("address_id") ON DELETE RESTRICT ON UPDATE CASCADE;
