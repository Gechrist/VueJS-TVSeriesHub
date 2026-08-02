/*
  Warnings:

  - You are about to drop the column `_links` on the `Series` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Series" DROP COLUMN "_links",
ADD COLUMN     "links" JSONB;
