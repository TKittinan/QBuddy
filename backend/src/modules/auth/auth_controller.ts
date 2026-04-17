import { Request, Response } from 'express';
import { AuthService } from './auth_service';

const auth_service = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      // ส่ง body ไปให้ service จัดการ hash password และ insert ลง supabase
      const user = await auth_service.register(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      // ถ้าอีเมลซ้ำ หรือ database error จะมาตกที่นี่
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await auth_service.login(req.body);
      
      // ส่งทั้ง user ข้อมูลย่อ และ token กลับไปให้ frontend
      res.json(result);
    } catch (error: any) {
      // ใช้ 401 Unauthorized สำหรับกรณี login พลาด
      res.status(401).json({ message: error.message });
    }
  }

  // แถม: ฟังก์ชันสำหรับตรวจสอบสถานะ token (เผื่อหน้าบ้านต้องใช้)
  async get_me(req: Request, res: Response) {
    try {
      // ปกติเราจะดึง user_id จาก middleware (req.user)
      // แต่ถ้าจะดึงตรงๆ ผ่าน id ก็ต้องใช้ as string เหมือนเดิม
      const userId = (req as any).user?.user_id; 
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      // สมมติว่ามีฟังก์ชันหา user ใน auth_service หรือ user_service
      // const user = await user_service.get_user_by_id(userId as string);
      // res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}