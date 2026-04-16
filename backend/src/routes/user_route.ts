import { Router } from "express";
import {
  getUsers,
  getUserById,
  deleteUser,
  createUser,
  updateUser,
} from "../controllers/user_controller";

import { authMiddleware } from "../middlewares/auth_middleware";
import { adminMiddleware } from "../middlewares/admin_middleware";
import { staffMiddleware } from "../middlewares/staff_middleware"; // เพิ่ม staffMiddleware

const router = Router();

// ทุกเส้นทางในนี้คือการจัดการ "ลูกค้า" (User Table)
// ดังนั้นเราจะใช้ adminMiddleware หรือ staffMiddleware เพื่อกั้นไม่ให้ลูกค้าจัดการกันเอง

// 1. สร้างลูกค้าใหม่ (ใช้ staffMiddleware เพราะพนักงานทั่วไปควรเพิ่มลูกค้าได้)
router.post("/", authMiddleware, staffMiddleware, createUser);

// 2. แก้ไขข้อมูลลูกค้า
router.put("/:id", authMiddleware, staffMiddleware, updateUser);

// 3. ดูรายชื่อลูกค้าทั้งหมด (Staff/Admin ดูได้)
router.get("/", authMiddleware, staffMiddleware, getUsers);

// 4. ดูรายละเอียดลูกค้าเฉพาะราย
router.get("/:id", authMiddleware, staffMiddleware, getUserById);

// 5. ลบลูกค้า (แนะนำให้ใช้ adminMiddleware เท่านั้น เพื่อความปลอดภัยสูงสุด)
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware, 
  deleteUser
);

export default router;