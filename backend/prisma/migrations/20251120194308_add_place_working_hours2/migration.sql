-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "PlaceWorkingHour" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "dayOfWeek" "Weekday" NOT NULL,
    "openTime" TEXT,
    "closeTime" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PlaceWorkingHour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlaceWorkingHour_placeId_idx" ON "PlaceWorkingHour"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaceWorkingHour_placeId_dayOfWeek_key" ON "PlaceWorkingHour"("placeId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "PlaceWorkingHour" ADD CONSTRAINT "PlaceWorkingHour_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;
