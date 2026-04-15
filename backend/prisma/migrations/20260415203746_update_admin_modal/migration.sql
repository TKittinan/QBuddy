/*
  Warnings:

  - The primary key for the `Admin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `admin_id` on the `Admin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_pkey",
DROP COLUMN "admin_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "email" DROP DEFAULT,
ALTER COLUMN "name" DROP DEFAULT,
ALTER COLUMN "password" DROP DEFAULT,
ADD CONSTRAINT "Admin_pkey" PRIMARY KEY ("id");
