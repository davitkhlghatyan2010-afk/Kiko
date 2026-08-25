-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "proof_id";

-- CreateTable
CREATE TABLE "proofs" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "ai_question" TEXT NOT NULL,
    "user_answer" TEXT,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proofs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proofs_task_id_key" ON "proofs"("task_id");

-- AddForeignKey
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

