/*
  Warnings:

  - Changed the type of `badge_category` on the `Badge` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Badge" DROP COLUMN "badge_category",
ADD COLUMN     "badge_category" INTEGER NOT NULL;
