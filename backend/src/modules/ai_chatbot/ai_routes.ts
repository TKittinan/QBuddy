import { Router } from "express";
import { askAI } from "./ai_controller";
// import { authMiddleware } from "../../common/middlewares/auth_middleware"; // ของ Mobile App ถ้ามีแล้วก็ใส่ middleware 

const router = Router();

/*

 รอใส่ middleware ตรวจสอบ token ของ mobile เพื่อความปลอดภัยของ API นี้ เพราะมันจะเรียกใช้บริการ AI ที่อาจมีค่าใช้จ่ายตามจำนวนคำถามที่ถาม

 */
router.post("/ask", askAI);

export default router;