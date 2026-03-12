-- AlterTable
ALTER TABLE "User"
ADD COLUMN "role" TEXT DEFAULT 'user',
ADD COLUMN "banned" BOOLEAN DEFAULT false,
ADD COLUMN "banReason" TEXT,
ADD COLUMN "banExpires" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Session"
ADD COLUMN "impersonatedBy" TEXT;
