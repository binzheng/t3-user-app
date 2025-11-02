-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "department" TEXT,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nameKana" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updatedBy" TEXT;
