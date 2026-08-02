/*
  Warnings:

  - A unique constraint covering the columns `[tvMazeId]` on the table `Series` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tvMazeId` to the `Series` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Series" ADD COLUMN     "tvMazeId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Series_tvMazeId_key" ON "public"."Series"("tvMazeId");
