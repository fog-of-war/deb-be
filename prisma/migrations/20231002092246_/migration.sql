/*
  Warnings:

  - Changed the type of `alert_type` on the `Alert` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "alert_type",
ADD COLUMN     "alert_type" TEXT NOT NULL;

-- DropEnum
DROP TYPE "AlertType";
