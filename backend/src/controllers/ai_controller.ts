import { Request, Response } from "express";
import { prisma } from "./../lib/prisma";

// generate recommendation logic หลักของ AI อยู่ตรงนี้
export const generateRecommendation = async (req: Request, res: Response) => {
  try {
    const user_id = Number(req.body.user_id);

    // หา user
    const user = await prisma.user.findUnique({
      where: { user_id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ดึง preference ของ user
    const preference = await prisma.user_Preference.findUnique({
      where: { user_id },
    });

    // ดึงร้านทั้งหมด พร้อม category
    const restaurants = await prisma.restaurant.findMany({
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    // ดึง booking ของ user (เอามาวิเคราะห์ behavior)
    const bookings = await prisma.booking.findMany({
      where: { user_id },
    });

    // map restaurant_id ที่ user เคยไป
    const visited = bookings.map((b) => b.restaurant_id);

    const results: any[] = [];

    // loop ร้านทั้งหมดเพื่อให้ score
    for (const r of restaurants) {
      let score = 0;
      let reason: string[] = [];

      // check category ที่ user ชอบ
      if (preference?.favorite_category) {
        const hasCategory = r.categories.some(
          (c) => c.category.name === preference.favorite_category
        );

        if (hasCategory) {
          score += 5;
          reason.push("matches your favorite category");
        }
      }

      // check budget (ง่าย ๆ เปรียบ string)
      if (preference?.budget_range && r.price_range) {
        if (preference.budget_range === r.price_range) {
          score += 3;
          reason.push("fits your budget");
        }
      }

      // ถ้าเคยไปแล้ว ลดคะแนน (อยากให้ลองใหม่)
      if (visited.includes(r.restaurant_id)) {
        score -= 2;
        reason.push("you already visited");
      }

      // rating สูง เพิ่มคะแนน
      if (r.average_rating && r.average_rating >= 4) {
        score += 2;
        reason.push("high rating");
      }

      // เก็บผลลัพธ์
      results.push({
        restaurant_id: r.restaurant_id,
        score,
        reason_text: reason.join(", "),
      });
    }

    // sort จาก score มากไปน้อย
    results.sort((a, b) => b.score - a.score);

    // เอา top 5
    const top = results.slice(0, 5);

    // ลบ recommendation เก่า
    await prisma.aI_Recommendation.deleteMany({
      where: { user_id },
    });

    // บันทึกลง DB
    for (const item of top) {
      await prisma.aI_Recommendation.create({
        data: {
          user_id,
          restaurant_id: item.restaurant_id,
          score: item.score,
          reason_text: item.reason_text,
        },
      });
    }

    res.json(top);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "error" });
  }
};


// ดึง recommendation ของ user
export const getRecommendation = async (req: Request, res: Response) => {
  try {
    const user_id = Number(req.params.user_id);

    const data = await prisma.aI_Recommendation.findMany({
      where: { user_id },
      include: {
        restaurant: true, // join ร้าน
      },
      orderBy: {
        score: "desc",
      },
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};