/*
  Warnings:

  - You are about to drop the column `links` on the `Series` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Series" DROP COLUMN "links",
ADD COLUMN     "_links" JSONB;
