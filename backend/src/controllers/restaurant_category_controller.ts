import { Request, Response } from "express";
import { prisma } from "./../lib/prisma";

// เพิ่ม category ให้ restaurant และ POST /restaurant-category

export const addCategoryToRestaurant = async (req: Request, res: Response) => {
  try {
    const { restaurant_id, category_id } = req.body;

    // check ว่ามี restaurant ไหม
    const restaurant = await prisma.restaurant.findUnique({
      where: { restaurant_id },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // check ว่ามี category ไหม
    const category = await prisma.category.findUnique({
      where: { category_id },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // ป้องกันซ้ำ 
    const exist = await prisma.restaurant_Category.findFirst({
      where: {
        restaurant_id,
        category_id,
      },
    });

    if (exist) {
      return res.status(400).json({ message: "Already added" });
    }

    // create relation
    const data = await prisma.restaurant_Category.create({
      data: {
        restaurant_id,
        category_id,
        image_url: req.body.image_url, // URL จาก supabase
      },
    });

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ลบ category ออกจาก restaurant DELETE /restaurant-category
export const removeCategoryFromRestaurant = async (req: Request, res: Response) => {
  try {
    const { restaurant_id, category_id } = req.body;

    // หา relation
    const exist = await prisma.restaurant_Category.findFirst({
      where: {
        restaurant_id,
        category_id,
      },
    });

    if (!exist) {
      return res.status(404).json({ message: "Relation not found" });
    }

    // delete
    await prisma.restaurant_Category.delete({
      where: {
        rc_id: exist.rc_id,
      },
    });

    res.json({ message: "Removed success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ดู category ของ restaurant  GET /restaurant-category/:restaurant_id

export const getCategoriesOfRestaurant = async (req: Request, res: Response) => {
  try {
    const { restaurant_id } = req.params;

    const data = await prisma.restaurant_Category.findMany({
      where: {
        restaurant_id: Number(restaurant_id),
      },
      include: {
        category: true, // join เอาข้อมูล category
      },
    });

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};