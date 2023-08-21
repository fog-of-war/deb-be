/*
  Warnings:

  - A unique constraint covering the columns `[place_name]` on the table `Place` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Place_place_name_key" ON "Place"("place_name");
