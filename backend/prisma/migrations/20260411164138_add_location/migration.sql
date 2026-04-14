-- CreateTable
CREATE TABLE "User_Location" (
    "location_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_Location_pkey" PRIMARY KEY ("location_id")
);

-- AddForeignKey
ALTER TABLE "User_Location" ADD CONSTRAINT "User_Location_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
