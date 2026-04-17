import { Request, Response } from 'express';
import { SettingsService } from './settings_service';

const settings_service = new SettingsService();

export class SettingsController {
  // ดึงข้อมูลการตั้งค่าระบบ
  async get(req: Request, res: Response) {
    try {
      const settings = await settings_service.get_settings();
      
      // ถ้ายังไม่มีการตั้งค่า (เป็น null) อาจจะส่ง default object หรือ 404
      // แต่ปกติส่ง null กลับไปให้หน้าบ้านจัดการก็ได้ครับ
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // อัปเดตข้อมูลการตั้งค่า (จะสร้างใหม่ถ้ายังไม่มี หรือแก้ไขถ้ามีแล้ว)
  async update(req: Request, res: Response) {
    try {
      // ส่งข้อมูลจาก body ไปให้ service ทำการ upsert (id: 1)
      const updated = await settings_service.update_settings(req.body);
      
      // ส่งข้อมูลที่อัปเดตแล้วกลับไป
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}