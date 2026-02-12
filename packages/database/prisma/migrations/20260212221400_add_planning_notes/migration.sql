-- CreateTable
CREATE TABLE "PlanningNote" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Note',
    "content" TEXT NOT NULL DEFAULT '',
    "quarter" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanningNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlanningNote_quarter_idx" ON "PlanningNote"("quarter");

-- CreateIndex
CREATE INDEX "PlanningNote_order_idx" ON "PlanningNote"("order");
