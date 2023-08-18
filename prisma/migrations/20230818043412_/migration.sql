/*
  Warnings:

  - Made the column `post_author_id` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_post_author_id_fkey";

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "post_author_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_post_author_id_fkey" FOREIGN KEY ("post_author_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
