import { Router } from "express";
import { login, registerAdmin } from "../controllers/auth_controller"; // นำเข้าชื่อฟังก์ชันให้ตรงกับ controller

const router = Router();

// สำหรับ Admin Panel:
// 1. เส้นทาง Login (ใช้ตาราง Admin)
router.post("/login", login); 

// 2. เส้นทางสมัคร Admin (ควรใช้ภายในเท่านั้น หรือใช้ทดสอบช่วงแรก)
// ถ้าคุณเปลี่ยนชื่อใน controller เป็น registerAdmin ให้แก้ตรงนี้ให้ตรงกัน
router.post("/register", registerAdmin); 

export default router;