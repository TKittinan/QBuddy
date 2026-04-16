/*
  Warnings:

  - The primary key for the `Message` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `conversation_id` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `message_id` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `message_text` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `sender_id` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `sent_at` on the `Message` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AI_Recommendation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Activity_Participant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Conversation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Conversation_Participant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Promotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Queue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Queue_Entry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Restaurant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Restaurant_Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User_Preference` table. If the table is not empty, all the data it contains will be lost.
  - The required column `id` was added to the `Message` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ADMIN', 'STAFF', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ONLINE', 'OFFLINE', 'UNVERIFIED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('Waiting', 'Serving', 'Completed', 'Skipped', 'Cancelled');

-- CreateEnum
CREATE TYPE "PlaceStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('Open', 'Closed', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "SupportCategory" AS ENUM ('Bug', 'Shop_Issue', 'General');

-- CreateEnum
CREATE TYPE "SupportStatus" AS ENUM ('Pending', 'Resolved');

-- DropForeignKey
ALTER TABLE "AI_Recommendation" DROP CONSTRAINT "AI_Recommendation_restaurant_id_fkey";

-- DropForeignKey
ALTER TABLE "AI_Recommendation" DROP CONSTRAINT "AI_Recommendation_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "Activity_Participant" DROP CONSTRAINT "Activity_Participant_activity_id_fkey";

-- DropForeignKey
ALTER TABLE "Activity_Participant" DROP CONSTRAINT "Activity_Participant_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_restaurant_id_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_activity_id_fkey";

-- DropForeignKey
ALTER TABLE "Conversation_Participant" DROP CONSTRAINT "Conversation_Participant_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "Conversation_Participant" DROP CONSTRAINT "Conversation_Participant_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_restaurant_id_fkey";

-- DropForeignKey
ALTER TABLE "Queue" DROP CONSTRAINT "Queue_restaurant_id_fkey";

-- DropForeignKey
ALTER TABLE "Queue_Entry" DROP CONSTRAINT "Queue_Entry_queue_id_fkey";

-- DropForeignKey
ALTER TABLE "Queue_Entry" DROP CONSTRAINT "Queue_Entry_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Restaurant_Category" DROP CONSTRAINT "Restaurant_Category_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Restaurant_Category" DROP CONSTRAINT "Restaurant_Category_restaurant_id_fkey";

-- DropForeignKey
ALTER TABLE "UserLocation" DROP CONSTRAINT "UserLocation_user_id_fkey";

-- DropForeignKey
ALTER TABLE "User_Preference" DROP CONSTRAINT "User_Preference_user_id_fkey";

-- AlterTable
ALTER TABLE "Message" DROP CONSTRAINT "Message_pkey",
DROP COLUMN "conversation_id",
DROP COLUMN "message_id",
DROP COLUMN "message_text",
DROP COLUMN "sender_id",
DROP COLUMN "sent_at",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "senderId" TEXT NOT NULL,
ADD COLUMN     "text" TEXT NOT NULL,
ADD COLUMN     "ticketId" TEXT NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "Message_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "aiConsented" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" "RoleType" NOT NULL DEFAULT 'CUSTOMER',
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "password" DROP NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "AI_Recommendation";

-- DropTable
DROP TABLE "Activity";

-- DropTable
DROP TABLE "Activity_Participant";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Conversation";

-- DropTable
DROP TABLE "Conversation_Participant";

-- DropTable
DROP TABLE "Promotion";

-- DropTable
DROP TABLE "Queue";

-- DropTable
DROP TABLE "Queue_Entry";

-- DropTable
DROP TABLE "Restaurant";

-- DropTable
DROP TABLE "Restaurant_Category";

-- DropTable
DROP TABLE "UserLocation";

-- DropTable
DROP TABLE "User_Preference";

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "PlaceStatus" NOT NULL DEFAULT 'Active',
    "description" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "avgServiceTime" INTEGER NOT NULL,
    "queueCount" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "monthlyBookings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TableType" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "placeId" TEXT NOT NULL,

    CONSTRAINT "TableType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "guests" INTEGER NOT NULL,
    "bookDate" TEXT,
    "bookTime" TEXT,
    "tableType" TEXT,
    "waitTime" INTEGER,
    "status" "TicketStatus" NOT NULL DEFAULT 'Waiting',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "placeId" TEXT NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyActivity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "meetingDate" TEXT NOT NULL,
    "meetingTime" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "maxGuests" INTEGER NOT NULL,
    "status" "ActivityStatus" NOT NULL DEFAULT 'Open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hostId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "bookingId" TEXT,

    CONSTRAINT "PartyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "pax" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "category" "SupportCategory" NOT NULL,
    "status" "SupportStatus" NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "businessName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "maxQueuePerDay" TEXT NOT NULL,
    "autoCancelMins" TEXT NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Place_placeId_key" ON "Place"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_userId_activityId_key" ON "Guest"("userId", "activityId");

-- AddForeignKey
ALTER TABLE "TableType" ADD CONSTRAINT "TableType_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyActivity" ADD CONSTRAINT "PartyActivity_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartyActivity" ADD CONSTRAINT "PartyActivity_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "PartyActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
