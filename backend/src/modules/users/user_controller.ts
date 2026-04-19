import { Request, Response } from 'express';
import { UserService } from './user_service';

const user_service = new UserService();

export class UserController {
  async list(req: Request, res: Response) {
    try {
      const users = await user_service.get_all_users();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async get_one(req: Request, res: Response) {
    try {
      const user = await user_service.get_user_by_id(req.params.id as string);
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // --- จุดที่แก้ไข: เพิ่มการบังคับ Status ---
  async create(req: Request, res: Response) {
    try {
      // กางข้อมูลเดิมออกมา แล้วทับ status ด้วย INACTIVE เพื่อป้องกันความผิดพลาด
      const userData = {
        ...req.body,
        status: 'INACTIVE' 
      };

      const new_user = await user_service.create_user(userData);
      res.status(201).json(new_user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const updated_user = await user_service.update_user(
        req.params.id as string, 
        req.body
      );
      res.json(updated_user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await user_service.delete_user(req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}