-- CreateTable
CREATE TABLE "Routine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT NOT NULL DEFAULT '#808080',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "variant" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineSection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "routineId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isTrackable" BOOLEAN NOT NULL DEFAULT false,
    "sectionId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineItemCompletion" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "routineDate" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoutineItemCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Routine_order_idx" ON "Routine"("order");

-- CreateIndex
CREATE INDEX "Routine_isArchived_idx" ON "Routine"("isArchived");

-- CreateIndex
CREATE INDEX "RoutineSection_routineId_idx" ON "RoutineSection"("routineId");

-- CreateIndex
CREATE INDEX "RoutineSection_order_idx" ON "RoutineSection"("order");

-- CreateIndex
CREATE INDEX "RoutineItem_sectionId_idx" ON "RoutineItem"("sectionId");

-- CreateIndex
CREATE INDEX "RoutineItem_parentId_idx" ON "RoutineItem"("parentId");

-- CreateIndex
CREATE INDEX "RoutineItem_order_idx" ON "RoutineItem"("order");

-- CreateIndex
CREATE INDEX "RoutineItemCompletion_itemId_idx" ON "RoutineItemCompletion"("itemId");

-- CreateIndex
CREATE INDEX "RoutineItemCompletion_routineDate_idx" ON "RoutineItemCompletion"("routineDate");

-- CreateIndex
CREATE UNIQUE INDEX "RoutineItemCompletion_itemId_routineDate_key" ON "RoutineItemCompletion"("itemId", "routineDate");

-- AddForeignKey
ALTER TABLE "RoutineSection" ADD CONSTRAINT "RoutineSection_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineItem" ADD CONSTRAINT "RoutineItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "RoutineSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineItem" ADD CONSTRAINT "RoutineItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "RoutineItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineItemCompletion" ADD CONSTRAINT "RoutineItemCompletion_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "RoutineItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
