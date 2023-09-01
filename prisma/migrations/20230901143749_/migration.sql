/*
  Warnings:

  - Added the required column `region_english_name` to the `Region` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Region" ADD COLUMN     "region_english_name" TEXT NOT NULL;
