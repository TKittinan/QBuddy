import { Router } from "express";
import { askAI } from "./ai_controller";
// แก้ไข path ให้ชี้ไปที่ไฟล์ตรงๆ ใต้โฟลเดอร์ common ค่ะ
import { auth_middleware } from "../../common/auth_middleware";

const router = Router();

// ใส่ authMiddleware คั่นกลางไว้เป็นด่านตรวจ
router.post("/", auth_middleware, askAI);

export default router;