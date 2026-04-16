import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth_middleware";
import { prisma } from "../lib/prisma";

export const staffMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. ตรวจสอบว่ามี adminId ใน Request หรือไม่ (จาก Token)
    if (!req.adminId) {
      return res.status(401).json({ message: "Not logged in" });
    }

    // 2. ค้นหาเจ้าหน้าที่ในตาราง Admin
    const admin = await prisma.admin.findUnique({
      where: {
        id: req.adminId, // เปลี่ยนจาก user_id เป็น admin_id ตาม Schema ใหม่
      },
    });

    // 3. ถ้าไม่พบข้อมูลในระบบ
    if (!admin) {
      return res.status(403).json({ message: "No permission" });
    }

    // 4. ตรวจสอบสิทธิ์: อนุญาตทั้งคนที่เป็น 'admin' และ 'staff'
    // (เพราะโดยปกติหน้าทั่วไป Staff ควรเข้าถึงได้ แต่หน้าตั้งค่าระบบอาจกั้นไว้ให้แค่ Admin)

    if (admin.role !== "admin" && admin.role !== "staff") {
      return res.status(403).json({ message: "Access denied: Staff/Admin only" });
    }

    // ผ่านการตรวจสอบ
    next();
  } catch (err) {
    console.error("Staff Middleware Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};