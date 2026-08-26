-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cutoff_changed_at" TIMESTAMP(3),
ADD COLUMN     "cutoff_time" TEXT NOT NULL DEFAULT '23:59';
