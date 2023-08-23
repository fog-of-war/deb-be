/*
  Warnings:

  - The primary key for the `MapPlaceCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `map_category_id` on the `MapPlaceCategory` table. All the data in the column will be lost.
  - You are about to drop the column `map_place_id` on the `MapPlaceCategory` table. All the data in the column will be lost.
  - You are about to drop the column `categoryCategory_id` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `place_category_ids` on the `Place` table. All the data in the column will be lost.
  - Added the required column `categoryId` to the `MapPlaceCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeId` to the `MapPlaceCategory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MapPlaceCategory" DROP CONSTRAINT "MapPlaceCategory_map_category_id_fkey";

-- DropForeignKey
ALTER TABLE "MapPlaceCategory" DROP CONSTRAINT "MapPlaceCategory_map_place_id_fkey";

-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_categoryCategory_id_fkey";

-- AlterTable
ALTER TABLE "MapPlaceCategory" DROP CONSTRAINT "MapPlaceCategory_pkey",
DROP COLUMN "map_category_id",
DROP COLUMN "map_place_id",
ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "placeId" INTEGER NOT NULL,
ADD CONSTRAINT "MapPlaceCategory_pkey" PRIMARY KEY ("placeId", "categoryId");

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "categoryCategory_id",
DROP COLUMN "place_category_ids";

-- AddForeignKey
ALTER TABLE "MapPlaceCategory" ADD CONSTRAINT "MapPlaceCategory_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapPlaceCategory" ADD CONSTRAINT "MapPlaceCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;
