/*
  Warnings:

  - Added the required column `alert_type` to the `Alert` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Type" AS ENUM ('NOTIFY', 'ACTIVITY');

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "alert_type" "Type" NOT NULL;
