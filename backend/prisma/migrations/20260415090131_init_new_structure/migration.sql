/*
  Warnings:

  - You are about to drop the column `user_id` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the `User_Location` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_user_id_fkey";

-- DropForeignKey
ALTER TABLE "User_Location" DROP CONSTRAINT "User_Location_user_id_fkey";

-- DropIndex
DROP INDEX "Admin_user_id_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "user_id",
ADD COLUMN     "email" TEXT NOT NULL DEFAULT 'temp@admin.com',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'temp',
ADD COLUMN     "password" TEXT NOT NULL DEFAULT '123456';

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "image_url" TEXT;

-- AlterTable
ALTER TABLE "Restaurant_Category" ADD COLUMN     "image_url" TEXT;

-- DropTable
DROP TABLE "User_Location";

-- CreateTable
CREATE TABLE "UserLocation" (
    "location_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("location_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
