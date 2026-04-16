import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// ปรับ Interface ให้รองรับข้อมูลจากตาราง Admin
export interface AuthRequest extends Request {
  adminId?: number; // เปลี่ยนจาก userId เป็น adminId ตามที่ตั้งไว้ใน auth_controller
  role?: string;    // เพิ่ม role เพื่อใช้เช็คสิทธิ์ admin/staff ในหน้าอื่นๆ
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;

  // 1. เช็คว่ามีการส่ง Header Authorization มาไหม
  if (!header) {
    return res.status(401).json({ message: "No token provided" });
  }

  // 2. แยก Bearer ออกจากตัว Token
  const token = header.split(" ")[1];

  try {
    // 3. ยืนยันความถูกต้องของ Token (คีย์ "secret" ต้องตรงกับใน auth_controller)
    const decoded = jwt.verify(token, "secret") as any;

    // 4. นำค่าที่ถอดรหัสได้มาเก็บไว้ใน request object

    // ** สำคัญ: ต้องใช้ชื่อคีย์ให้ตรงกับตอนที่เรา jwt.sign ใน auth_controller
    req.adminId = decoded.adminId; 
    req.role = decoded.role;

    next(); 
  } catch (error) {

    // กรณี Token หมดอายุ หรือถูกแก้ไข
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};