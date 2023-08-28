/*
  Warnings:

  - Added the required column `place_region_id` to the `Place` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "place_region_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Region" (
    "region_id" SERIAL NOT NULL,
    "region_name" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("region_id")
);

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_place_region_id_fkey" FOREIGN KEY ("place_region_id") REFERENCES "Region"("region_id") ON DELETE RESTRICT ON UPDATE CASCADE;
