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

  // ฟังก์ชันสำหรับขอรีเซ็ตรหัสผ่านไว้เชื่อมกับฟีเจอร์ "ลืมรหัสผ่าน" ของ Moblie
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "กรุณาระบุอีเมล" });
      }

      // ส่งอีเมลไปให้ service จัดการสร้าง Token และส่งเมลจริง
      await auth_service.forgotPassword(email);

      // เรามักจะส่งข้อความกลางๆ กลับไปเพื่อความปลอดภัย (ไม่บอกว่ามีเมลนี้ในระบบไหม)
      res.json({ message: "หากมีอีเมลนี้ในระบบ ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านให้ท่านในเร็วๆ นี้" });
    } catch (error: any) {
      // กรณีเกิด Error ทั่วไป เช่น Database พัง หรือระบบส่งเมลมีปัญหา
      res.status(500).json({ message: error.message });
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