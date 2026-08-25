-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('artifact', 'knowledge');

-- CreateEnum
CREATE TYPE "DayCredit" AS ENUM ('full', 'none');

-- CreateTable
CREATE TABLE "days" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "deadline_at" TIMESTAMP(3) NOT NULL,
    "declared_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "credit" "DayCredit",

    CONSTRAINT "days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "day_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "type" "TaskType" NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "proof_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "days_user_id_date_key" ON "days"("user_id", "date");

-- AddForeignKey
ALTER TABLE "days" ADD CONSTRAINT "days_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "days"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

