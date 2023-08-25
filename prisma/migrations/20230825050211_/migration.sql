/*
  Warnings:

  - You are about to drop the column `category_score` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `level_min_score` on the `Level` table. All the data in the column will be lost.
  - You are about to drop the column `level_name` on the `Level` table. All the data in the column will be lost.
  - You are about to drop the column `level_number` on the `Level` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[level_level]` on the table `Level` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `level_description` to the `Level` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level_level` to the `Level` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level_points` to the `Level` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Level_level_number_key";

-- AlterTable
ALTER TABLE "Badge" ADD COLUMN     "badge_point" INTEGER DEFAULT 100;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "category_score",
ADD COLUMN     "category_point" INTEGER;

-- AlterTable
ALTER TABLE "Level" DROP COLUMN "level_min_score",
DROP COLUMN "level_name",
DROP COLUMN "level_number",
ADD COLUMN     "level_description" TEXT NOT NULL,
ADD COLUMN     "level_level" INTEGER NOT NULL,
ADD COLUMN     "level_points" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Level_level_level_key" ON "Level"("level_level");
