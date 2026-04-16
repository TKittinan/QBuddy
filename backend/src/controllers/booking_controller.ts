import { Request, Response } from "express";
import { prisma } from "./../lib/prisma";

// สร้าง booking user ต้องมี restaurant ต้องมี

export const createBooking = async (req: Request, res: Response) => {
  try {
    // รับค่าจาก body
    const user_id = Number(req.body.user_id);
    const restaurant_id = Number(req.body.restaurant_id);
    const party_size = Number(req.body.party_size);
    const booking_datetime = new Date(req.body.booking_datetime);
    const special_request = req.body.special_request;

    // check user
    const user = await prisma.user.findUnique({
      where: { user_id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { restaurant_id },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // create booking
    const data = await prisma.booking.create({
      data: {
        user_id,
        restaurant_id,
        party_size,
        booking_datetime,
        special_request,
        status: "pending", // default status
      },
    });

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

// ดู booking ทั้งหมด
export const getBookings = async (req: Request, res: Response) => {
  try {
    const data = await prisma.booking.findMany({
      include: {
        user: true,
        restaurant: true,
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};


// ดู booking ของ user
export const getBookingByUser = async (req: Request, res: Response) => {
  try {
    const user_id = Number(req.params.user_id);

    const data = await prisma.booking.findMany({
      where: {
        user_id,
      },
      include: {
        restaurant: true,
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};


// ยกเลิก booking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const booking_id = Number(req.params.id);

    const exist = await prisma.booking.findUnique({
      where: { booking_id },
    });

    if (!exist) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // update status แทน delete (ระบบจริงใช้แบบนี้)
    const data = await prisma.booking.update({
      where: { booking_id },
      data: {
        status: "cancelled",
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};