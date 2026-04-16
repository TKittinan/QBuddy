import { Request, Response } from "express";
import { prisma } from "./../lib/prisma";

// สร้าง promotion ต้องมี restaurant ก่อน
export const createPromotion = async (req: Request, res: Response) => {
  try {
    const restaurant_id = Number(req.body.restaurant_id);
    const title = req.body.title;
    const description = req.body.description;
    const discount_percent = Number(req.body.discount_percent);
    const start_date = new Date(req.body.start_date);
    const end_date = new Date(req.body.end_date);

    // check restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { restaurant_id },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // create promotion
    const data = await prisma.promotion.create({
      data: {
        restaurant_id,
        title,
        description,
        discount_percent,
        start_date,
        end_date,
        status: "active",
      },
    });

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};

// ดู promotion ทั้งหมด
export const getPromotions = async (req: Request, res: Response) => {
  try {
    const data = await prisma.promotion.findMany({
      include: {
        restaurant: true,
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};


// ดู promotion ของ restaurant
export const getPromotionByRestaurant = async (
  req: Request,
  res: Response
) => {
  try {
    const restaurant_id = Number(req.params.restaurant_id);

    const data = await prisma.promotion.findMany({
      where: {
        restaurant_id,
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};


//ดู promotion ที่ยังใช้งานได้ ต้องอยู่ในช่วง start_date - end_date
export const getActivePromotions = async (
  req: Request,
  res: Response
) => {
  try {
    const now = new Date();

    const data = await prisma.promotion.findMany({
      where: {
        status: "active",

        start_date: {
          lte: now, // start <= now
        },

        end_date: {
          gte: now, // end >= now
        },
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


// ลบ promotion
export const deletePromotion = async (req: Request, res: Response) => {
  try {
    const promo_id = Number(req.params.id);

    const exist = await prisma.promotion.findUnique({
      where: { promo_id },
    });

    if (!exist) {
      return res.status(404).json({ message: "not found" });
    }

    await prisma.promotion.delete({
      where: { promo_id },
    });

    res.json({ message: "deleted" });
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};