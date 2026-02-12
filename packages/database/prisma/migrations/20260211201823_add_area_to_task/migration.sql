-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "areaId" TEXT;

-- CreateIndex
CREATE INDEX "Task_areaId_idx" ON "Task"("areaId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;
