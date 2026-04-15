import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth_middleware";
import { prisma } from "../lib/prisma";

export const adminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. เช็คว่าผ่านการ Login มาหรือยัง (เช็ค adminId จาก Token)
    if (!req.adminId) {
      return res.status(401).json({ message: "Not logged in" });
    }

    // 2. ค้นหาข้อมูลในตาราง Admin โดยใช้ adminId
    const admin = await prisma.admin.findUnique({
      where: {
        admin_id: req.adminId, // เปลี่ยนจาก user_id เป็น admin_id
      },
    });

    // 3. ถ้าไม่เจอข้อมูลในตาราง Admin
    if (!admin) {
      return res.status(403).json({ message: "No permission (Admin only)" });
    }

    // 4. เช็คสิทธิ์ (ให้ทั้ง admin และ staff ผ่านได้ หรือตามแต่คุณกำหนด)
    if (admin.role !== "admin" && admin.role !== "staff") {
      return res.status(403).json({ message: "Not allowed: Access denied" });
    }

    next();
  } catch (err) {
    console.error("Admin Middleware Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};