/*
  Warnings:

  - Added the required column `badge_image_url` to the `Badge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Badge" ADD COLUMN     "badge_image_url" TEXT NOT NULL;
