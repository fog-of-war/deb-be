/*
  Warnings:

  - You are about to drop the column `badge_point` on the `Badge` table. All the data in the column will be lost.
  - You are about to drop the column `category_point` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `place_point` on the `Place` table. All the data in the column will be lost.
  - You are about to drop the column `user_point` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Badge" DROP COLUMN "badge_point",
ADD COLUMN     "badge_points" INTEGER DEFAULT 100;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "category_point",
ADD COLUMN     "category_points" INTEGER;

-- AlterTable
ALTER TABLE "Place" DROP COLUMN "place_point",
ADD COLUMN     "place_points" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "user_point",
ADD COLUMN     "user_points" INTEGER NOT NULL DEFAULT 0;
