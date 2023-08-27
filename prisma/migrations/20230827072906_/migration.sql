/*
  Warnings:

  - Added the required column `rank` to the `UserRanking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserRanking" ADD COLUMN     "rank" INTEGER NOT NULL;
