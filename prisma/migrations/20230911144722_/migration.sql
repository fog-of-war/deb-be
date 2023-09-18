-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BASIC', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "user_email" TEXT,
    "user_providerId" TEXT NOT NULL,
    "user_image_url" TEXT,
    "user_nickname" TEXT,
    "user_points" INTEGER NOT NULL DEFAULT 0,
    "user_level" INTEGER NOT NULL DEFAULT 0,
    "user_is_admin" "Role" NOT NULL DEFAULT 'BASIC',
    "user_selected_badge_id" INTEGER NOT NULL DEFAULT 1,
    "user_is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "user_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_updated_at" TIMESTAMP(3) NOT NULL,
    "user_delete_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_refresh_token" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "badge_id" SERIAL NOT NULL,
    "badge_name" TEXT NOT NULL,
    "badge_category_id" INTEGER NOT NULL,
    "badge_criteria" INTEGER NOT NULL,
    "badge_points" INTEGER DEFAULT 100,
    "badge_image_url" TEXT NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("badge_id")
);

-- CreateTable
CREATE TABLE "UserRanking" (
    "user_id" INTEGER NOT NULL,
    "user_points" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "UserRanking_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "UserActivities" (
    "activity_id" SERIAL NOT NULL,
    "activity_user_id" INTEGER,
    "activity_type" TEXT NOT NULL,
    "activity_details" JSONB NOT NULL,
    "activity_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivities_pkey" PRIMARY KEY ("activity_id")
);

-- CreateTable
CREATE TABLE "Post" (
    "post_id" SERIAL NOT NULL,
    "post_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "post_updated_at" TIMESTAMP(3) NOT NULL,
    "post_description" TEXT,
    "post_image_url" TEXT NOT NULL,
    "post_author_id" INTEGER NOT NULL,
    "post_star_rating" DOUBLE PRECISION,
    "post_place_id" INTEGER,
    "post_is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "PlaceVisit" (
    "visited_id" SERIAL NOT NULL,
    "visited_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "visited_place_id" INTEGER NOT NULL,
    "visited_user_id" INTEGER NOT NULL,

    CONSTRAINT "PlaceVisit_pkey" PRIMARY KEY ("visited_id")
);

-- CreateTable
CREATE TABLE "Place" (
    "place_id" SERIAL NOT NULL,
    "place_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "place_updated_at" TIMESTAMP(3) NOT NULL,
    "place_name" TEXT NOT NULL,
    "place_star_rating" DOUBLE PRECISION,
    "place_points" INTEGER,
    "place_address" TEXT,
    "place_region_id" INTEGER,
    "place_latitude" DOUBLE PRECISION,
    "place_longitude" DOUBLE PRECISION,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("place_id")
);

-- CreateTable
CREATE TABLE "Region" (
    "region_id" SERIAL NOT NULL,
    "region_name" TEXT NOT NULL,
    "region_english_name" TEXT NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("region_id")
);

-- CreateTable
CREATE TABLE "Category" (
    "category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "category_points" INTEGER,
    "category_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "MapPlaceCategory" (
    "placeId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "MapPlaceCategory_pkey" PRIMARY KEY ("placeId","categoryId")
);

-- CreateTable
CREATE TABLE "SearchHistory" (
    "search_history_id" SERIAL NOT NULL,
    "search_keyword" TEXT NOT NULL,
    "search_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "search_user_id" INTEGER NOT NULL,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("search_history_id")
);

-- CreateTable
CREATE TABLE "Level" (
    "level_id" SERIAL NOT NULL,
    "level_level" INTEGER NOT NULL,
    "level_points" INTEGER NOT NULL,
    "level_description" TEXT NOT NULL,
    "level_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("level_id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "alert_id" SERIAL NOT NULL,
    "alert_post_id" INTEGER NOT NULL,
    "alert_region_id" INTEGER NOT NULL,
    "alert_place_id" INTEGER NOT NULL,
    "alert_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("alert_id")
);

-- CreateTable
CREATE TABLE "_BadgeToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "User_user_email_user_points_user_level_user_created_at_idx" ON "User"("user_email", "user_points", "user_level", "user_created_at");

-- CreateIndex
CREATE INDEX "Post_post_author_id_post_place_id_post_created_at_post_is_d_idx" ON "Post"("post_author_id", "post_place_id", "post_created_at", "post_is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "Place_place_name_key" ON "Place"("place_name");

-- CreateIndex
CREATE INDEX "Place_place_name_place_address_place_star_rating_place_regi_idx" ON "Place"("place_name", "place_address", "place_star_rating", "place_region_id", "place_created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Category_category_name_key" ON "Category"("category_name");

-- CreateIndex
CREATE UNIQUE INDEX "Level_level_level_key" ON "Level"("level_level");

-- CreateIndex
CREATE UNIQUE INDEX "_BadgeToUser_AB_unique" ON "_BadgeToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_BadgeToUser_B_index" ON "_BadgeToUser"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_user_selected_badge_id_fkey" FOREIGN KEY ("user_selected_badge_id") REFERENCES "Badge"("badge_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_badge_category_id_fkey" FOREIGN KEY ("badge_category_id") REFERENCES "Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivities" ADD CONSTRAINT "UserActivities_activity_user_id_fkey" FOREIGN KEY ("activity_user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_post_author_id_fkey" FOREIGN KEY ("post_author_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_post_place_id_fkey" FOREIGN KEY ("post_place_id") REFERENCES "Place"("place_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceVisit" ADD CONSTRAINT "PlaceVisit_visited_place_id_fkey" FOREIGN KEY ("visited_place_id") REFERENCES "Place"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceVisit" ADD CONSTRAINT "PlaceVisit_visited_user_id_fkey" FOREIGN KEY ("visited_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_place_region_id_fkey" FOREIGN KEY ("place_region_id") REFERENCES "Region"("region_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapPlaceCategory" ADD CONSTRAINT "MapPlaceCategory_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MapPlaceCategory" ADD CONSTRAINT "MapPlaceCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_search_user_id_fkey" FOREIGN KEY ("search_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BadgeToUser" ADD CONSTRAINT "_BadgeToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Badge"("badge_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BadgeToUser" ADD CONSTRAINT "_BadgeToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION alert_post_created() RETURNS trigger AS $$
DECLARE
   new_post_place_id INT;
   new_place_region_id INT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        SELECT post_place_id INTO new_post_place_id
        FROM "Post"
        WHERE post_id = NEW.post_id;

        IF new_post_place_id IS NOT NULL THEN
            SELECT place_region_id INTO new_place_region_id
            FROM "Place"
            WHERE place_id = new_post_place_id;
        END IF;
        
        IF new_place_region_id IS NOT NULL THEN
            INSERT INTO "Alerts" (alert_post_id, alert_region_id, alert_place_id) VALUES (NEW.post_id, new_place_region_id, new_post_place_id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_alert_post_created
AFTER INSERT
ON "Post"
FOR EACH ROW
EXECUTE FUNCTION alert_post_created();


CREATE OR REPLACE FUNCTION notify_alert_insert() RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('alert_insert', NEW.alert_id::TEXT);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_alert_insert
AFTER INSERT
ON "Alert"
FOR EACH ROW
EXECUTE FUNCTION notify_alert_insert();