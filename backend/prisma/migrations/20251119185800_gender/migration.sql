-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MAN', 'WOMAN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "gender" "Gender",
ADD COLUMN     "name" TEXT,
ADD COLUMN     "surname" TEXT;
