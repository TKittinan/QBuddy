import { Request, Response } from 'express';
import { AuthService } from './auth_service';

const auth_service = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const user = await auth_service.register(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await auth_service.login(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  // เพิ่มฟังก์ชัน logout เพื่อส่งต่อ userId ไปยัง service สำหรับอัปเดตสถานะ
  async logout(req: Request, res: Response) {
    try {
      // ดึง userId จาก middleware (ที่แนบมากับ req.user หลังตรวจสอบ Token)
      const userId = (req as any).user?.user_id;

      if (!userId) {
        return res.status(401).json({ message: "ไม่พบข้อมูลผู้ใช้" });
      }

      await auth_service.logout(userId);
      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "กรุณาระบุอีเมล" });
      }

      await auth_service.forgotPassword(email);
      res.json({ message: "หากมีอีเมลนี้ในระบบ ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านให้ท่านในเร็วๆ นี้" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async get_me(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id; 
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      // ส่วนนี้สามารถเรียกใช้ userService.getById(userId) เพื่อคืนค่าโปรไฟล์ล่าสุดได้
      res.json({ user_id: userId });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}