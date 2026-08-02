/*
  Warnings:

  - Changed the type of `notifications` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Series" ADD COLUMN     "averageRuntime" INTEGER,
ADD COLUMN     "dvdCountry" JSONB,
ADD COLUMN     "links" JSONB,
ADD COLUMN     "previousepisode" JSONB,
ADD COLUMN     "runtime" INTEGER,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "updated" INTEGER,
ADD COLUMN     "weight" INTEGER;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "notifications",
ADD COLUMN     "notifications" JSONB NOT NULL;
