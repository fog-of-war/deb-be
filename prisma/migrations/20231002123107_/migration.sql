-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_alerted_user_id_fkey";

-- AlterTable
ALTER TABLE "Alert" ALTER COLUMN "alerted_user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_alerted_user_id_fkey" FOREIGN KEY ("alerted_user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
