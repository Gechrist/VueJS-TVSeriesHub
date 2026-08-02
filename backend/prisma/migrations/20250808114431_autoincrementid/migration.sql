/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Series` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
CREATE SEQUENCE "public".series_id_seq;
ALTER TABLE "public"."Series" ALTER COLUMN "id" SET DEFAULT nextval('"public".series_id_seq');
ALTER SEQUENCE "public".series_id_seq OWNED BY "public"."Series"."id";

-- CreateIndex
CREATE UNIQUE INDEX "Series_id_key" ON "public"."Series"("id");
