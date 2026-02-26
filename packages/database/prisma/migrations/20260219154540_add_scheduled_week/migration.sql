-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "scheduledWeek" TEXT;

-- CreateIndex
CREATE INDEX "Task_scheduledWeek_idx" ON "Task"("scheduledWeek");
