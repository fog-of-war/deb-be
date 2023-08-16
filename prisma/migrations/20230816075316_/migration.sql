-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BASIC', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_image_url" TEXT,
    "user_nickname" TEXT,
    "user_point" INTEGER NOT NULL DEFAULT 0,
    "user_level" INTEGER NOT NULL DEFAULT 1,
    "user_is_admin" "Role" NOT NULL DEFAULT 'BASIC',
    "user_is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "user_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_updated_at" TIMESTAMP(3) NOT NULL,
    "user_refresh_token" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
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
    "post_author_id" INTEGER,
    "post_star_rating" DOUBLE PRECISION,
    "post_place_id" INTEGER,
    "post_is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "Place" (
    "place_id" SERIAL NOT NULL,
    "place_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "place_updated_at" TIMESTAMP(3) NOT NULL,
    "place_name" TEXT NOT NULL,
    "place_star_rating" DOUBLE PRECISION,
    "place_point" INTEGER,
    "place_address" TEXT,
    "place_latitude" DOUBLE PRECISION,
    "place_longitude" DOUBLE PRECISION,
    "place_category_id" INTEGER NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("place_id")
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
CREATE TABLE "Category" (
    "category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "category_score" INTEGER,
    "category_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "badge_id" SERIAL NOT NULL,
    "badge_name" TEXT NOT NULL,
    "badge_category" TEXT NOT NULL,
    "badge_criteria" INTEGER NOT NULL,
    "badge_user_id" INTEGER,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("badge_id")
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
    "level_number" INTEGER NOT NULL,
    "level_name" TEXT NOT NULL,
    "level_min_score" INTEGER NOT NULL,
    "level_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("level_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_email_key" ON "User"("user_email");

-- CreateIndex
CREATE UNIQUE INDEX "Level_level_number_key" ON "Level"("level_number");

-- AddForeignKey
ALTER TABLE "UserActivities" ADD CONSTRAINT "UserActivities_activity_user_id_fkey" FOREIGN KEY ("activity_user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_post_author_id_fkey" FOREIGN KEY ("post_author_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_post_place_id_fkey" FOREIGN KEY ("post_place_id") REFERENCES "Place"("place_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_place_category_id_fkey" FOREIGN KEY ("place_category_id") REFERENCES "Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceVisit" ADD CONSTRAINT "PlaceVisit_visited_place_id_fkey" FOREIGN KEY ("visited_place_id") REFERENCES "Place"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaceVisit" ADD CONSTRAINT "PlaceVisit_visited_user_id_fkey" FOREIGN KEY ("visited_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_badge_user_id_fkey" FOREIGN KEY ("badge_user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchHistory" ADD CONSTRAINT "SearchHistory_search_user_id_fkey" FOREIGN KEY ("search_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
