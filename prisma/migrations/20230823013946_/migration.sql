/*
  Warnings:

  - You are about to drop the column `badge_category` on the `Badge` table. All the data in the column will be lost.
  - You are about to drop the column `place_category_id` on the `Place` table. All the data in the column will be lost.
  - Added the required column `badge_category_id` to the `Badge` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Place" DROP CONSTRAINT "Place_place_category_id_fkey";

-- AlterTable
ALTER TABLE "Badge" DROP COLUMN "badge_category",
ADD COLUMN     "badge_category_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "place_category_id",
ADD COLUMN     "place_category_ids" INTEGER[];

-- CreateTable
CREATE TABLE "_PlaceToCategories" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PlaceToCategories_AB_unique" ON "_PlaceToCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_PlaceToCategories_B_index" ON "_PlaceToCategories"("B");

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_badge_category_id_fkey" FOREIGN KEY ("badge_category_id") REFERENCES "Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaceToCategories" ADD CONSTRAINT "_PlaceToCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaceToCategories" ADD CONSTRAINT "_PlaceToCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Place"("place_id") ON DELETE CASCADE ON UPDATE CASCADE;
