/*
  Warnings:

  - Added the required column `alerted_user_id` to the `Alert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "alerted_user_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_alerted_user_id_fkey" FOREIGN KEY ("alerted_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
