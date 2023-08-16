/*
  Warnings:

  - Added the required column `user_providerId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "user_providerId" TEXT NOT NULL;
