/*
  Warnings:

  - You are about to drop the column `badge_user_id` on the `Badge` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Badge" DROP CONSTRAINT "Badge_badge_user_id_fkey";

-- AlterTable
ALTER TABLE "Badge" DROP COLUMN "badge_user_id",
ADD COLUMN     "badge_owned_users_id" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "user_selected_badge_id" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_user_selected_badge_id_fkey" FOREIGN KEY ("user_selected_badge_id") REFERENCES "Badge"("badge_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_badge_owned_users_id_fkey" FOREIGN KEY ("badge_owned_users_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
