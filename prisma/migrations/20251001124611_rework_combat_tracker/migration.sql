/*
  Warnings:

  - You are about to drop the column `currentHp` on the `Initiative` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Combat" ADD COLUMN     "phase" TEXT NOT NULL DEFAULT 'setup';

-- AlterTable
ALTER TABLE "Initiative" DROP COLUMN "currentHp",
ADD COLUMN     "damageTaken" INTEGER NOT NULL DEFAULT 0;
