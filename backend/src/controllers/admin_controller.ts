import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// สร้าง admin จาก user ที่มีอยู่แล้ว
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const user_id = Number(req.body.user_id);
    const role = req.body.role || "admin";

    // check user
    const user = await prisma.user.findUnique({
      where: { user_id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check ซ้ำ
    const exist = await prisma.admin.findUnique({
      where: { user_id },
    });

    if (exist) {
      return res.status(400).json({ message: "Already admin" });
    }

    // create admin
    const data = await prisma.admin.create({
      data: {
        user_id,
        role,
      },
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};


// ลบสิทธิ์ admin (กลับเป็น user ธรรมดา)
export const removeAdmin = async (req: Request, res: Response) => {
  try {
    const user_id = Number(req.body.user_id);

    const admin = await prisma.admin.findUnique({
      where: { user_id },
    });

    if (!admin) {
      return res.status(404).json({ message: "Not admin" });
    }

    await prisma.admin.delete({
      where: { user_id },
    });

    res.json({ message: "removed admin" });
  } catch (error) {
    res.status(500).json({ message: "error" });
  }
};