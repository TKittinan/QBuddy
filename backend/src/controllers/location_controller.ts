import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// บันทึก location ใหม่ (ทุก 5-10 วิ)
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const user_id = Number(req.body.user_id);
    const latitude = Number(req.body.latitude);
    const longitude = Number(req.body.longitude);

    // check user
    const user = await prisma.user.findUnique({
      where: { user_id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // create location (เก็บ history)
    const location = await prisma.userLocation.create({
      data: {
        user_id,
        latitude,
        longitude,
      },
    });

    res.json(location);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};


// ดึง location ล่าสุดของ user
export const getLatestLocation = async (req: Request, res: Response) => {
  try {
    const user_id = Number(req.params.user_id);

    const location = await prisma.userLocation.findFirst({
      where: { user_id },
      orderBy: {
        created_at: "desc",
      },
    });

    res.json(location);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};