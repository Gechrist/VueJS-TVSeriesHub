-- CreateTable
CREATE TABLE "public"."Series" (
    "id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT,
    "genres" TEXT[],
    "status" TEXT,
    "premiered" TEXT,
    "ended" TEXT,
    "officialSite" TEXT,
    "schedule" JSONB,
    "rating" JSONB,
    "network" JSONB,
    "webChannel" JSONB,
    "externals" JSONB,
    "image" JSONB,
    "summary" TEXT,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" INTEGER NOT NULL,
    "watchlist" TEXT[],
    "notifications" JSONB[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
