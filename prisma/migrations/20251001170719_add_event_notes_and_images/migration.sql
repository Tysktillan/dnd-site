-- AlterTable
ALTER TABLE "TimelineEvent" ADD COLUMN     "imageUrls" TEXT;

-- CreateTable
CREATE TABLE "EventNote" (
    "id" TEXT NOT NULL,
    "timelineEventId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventNote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventNote" ADD CONSTRAINT "EventNote_timelineEventId_fkey" FOREIGN KEY ("timelineEventId") REFERENCES "TimelineEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
