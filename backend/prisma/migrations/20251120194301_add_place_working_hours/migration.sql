-- AlterTable
ALTER TABLE "PlaceImage" ADD COLUMN     "altText" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "source" SET DEFAULT 'MANUAL';

-- CreateIndex
CREATE INDEX "PlaceImage_placeId_idx" ON "PlaceImage"("placeId");
