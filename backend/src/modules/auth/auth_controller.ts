import { Request, Response } from 'express';
import { AuthService } from './auth_service';

const auth_service = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const userData = {
        ...req.body,
        // ถ้าหน้าบ้านไม่ส่ง status มา หรือส่งมาเป็นค่าอื่น 
        // เราจะบังคับให้เป็น INACTIVE สำหรับการลงทะเบียนใหม่
        status: req.body.status || 'INACTIVE' 
      };

      const user = await auth_service.register(userData);
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

  async logout(req: Request, res: Response) {
    try {
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

      // ส่ง email ไปให้ service จัดการ
      await auth_service.forgotPassword(email);
      
      // ส่งข้อความตอบกลับที่ชัดเจนเพื่อให้ Mobile นำไปแสดงผล
      res.json({ message: "ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลของท่านเรียบร้อยแล้ว" });
    } catch (error: any) {
      // ถ้าใน service โยน Error ว่า "User not found" 
      // เราจะส่ง 404 กลับไป เพื่อให้หน้า Mobile เข้าเงื่อนไข else และโชว์ Error สีแดง
      if (error.message === "User not found" || error.message.includes("ไม่พบ")) {
        return res.status(404).json({ message: "ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีกครั้ง" });
      }
      res.status(500).json({ message: error.message });
    }
  }

  async get_me(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.user_id; 
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      res.json({ user_id: userId });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}