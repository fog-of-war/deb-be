/*
  Warnings:

  - You are about to drop the `_PlaceToCategories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PlaceToCategories" DROP CONSTRAINT "_PlaceToCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlaceToCategories" DROP CONSTRAINT "_PlaceToCategories_B_fkey";

-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "categoryCategory_id" INTEGER;

-- DropTable
DROP TABLE "_PlaceToCategories";

-- CreateTable
CREATE TABLE "MapPlaceCategory" (
    "map_place_id" INTEGER NOT NULL,
    "map_category_id" INTEGER NOT NULL,

    CONSTRAINT "MapPlaceCategory_pkey" PRIMARY KEY ("map_place_id","map_category_id")
);

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_categoryCategory_id_fkey" FOREIGN KEY ("categoryCategory_id") REFERENCES "Category"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapPlaceCategory" ADD CONSTRAINT "MapPlaceCategory_map_place_id_fkey" FOREIGN KEY ("map_place_id") REFERENCES "Place"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapPlaceCategory" ADD CONSTRAINT "MapPlaceCategory_map_category_id_fkey" FOREIGN KEY ("map_category_id") REFERENCES "Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;
