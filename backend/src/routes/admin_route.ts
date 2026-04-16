import { Router } from "express";
import { 
  getAllAdmins, 
  createAdmin, 
  updateAdmin, 
  deleteAdmin 
} from "../controllers/admin_controller";

import { authMiddleware } from "../middlewares/auth_middleware";
import { adminMiddleware } from "../middlewares/admin_middleware";

const router = Router();

// ใช้ Middleware กั้นทุกเส้นทาง: ต้อง Login และต้องเป็น Admin เท่านั้น
router.use(authMiddleware);
router.use(adminMiddleware);

// 1. ดึงรายชื่อเจ้าหน้าที่ทั้งหมด (สำหรับตารางในหน้า Staff Management)
router.get("/", getAllAdmins);

// 2. สร้างเจ้าหน้าที่ใหม่ (Admin/Staff)
router.post("/", createAdmin);

// 3. แก้ไขข้อมูลเจ้าหน้าที่ (ระบุผ่าน ID)
router.put("/:id", updateAdmin);

// 4. ลบเจ้าหน้าที่ออกจากระบบ (ระบุผ่าน ID)
router.delete("/:id", deleteAdmin);

export default router;