-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT NOT NULL DEFAULT '#808080',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaGoal" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AreaGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Area_order_idx" ON "Area"("order");

-- CreateIndex
CREATE INDEX "AreaGoal_areaId_idx" ON "AreaGoal"("areaId");

-- CreateIndex
CREATE INDEX "AreaGoal_period_idx" ON "AreaGoal"("period");

-- CreateIndex
CREATE UNIQUE INDEX "AreaGoal_areaId_period_key" ON "AreaGoal"("areaId", "period");

-- AddForeignKey
ALTER TABLE "AreaGoal" ADD CONSTRAINT "AreaGoal_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;
