-- AlterTable
ALTER TABLE "PlannerItem" ALTER COLUMN "sessionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "campaignId" DROP NOT NULL;
