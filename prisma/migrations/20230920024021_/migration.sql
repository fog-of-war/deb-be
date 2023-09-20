-- AlterTable
ALTER TABLE "Alert" ALTER COLUMN "alert_post_id" DROP NOT NULL,
ALTER COLUMN "alert_region_id" DROP NOT NULL,
ALTER COLUMN "alert_place_id" DROP NOT NULL;
