import { Request, Response } from 'express';
import { SupportService } from './support_service';

const support_service = new SupportService();

export class SupportController {
  // สร้างตั๋วใหม่
  async create_ticket(req: Request, res: Response) {
    try {
      const ticket = await support_service.create_support_ticket(req.body);
      res.status(201).json(ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // ส่งข้อความคุยในตั๋ว
  async post_message(req: Request, res: Response) {
    try {
      const message = await support_service.send_message(req.body);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // ดึงข้อความทั้งหมดในตั๋ว
  async get_messages(req: Request, res: Response) {
    try {
      const ticket_data = await support_service.get_ticket_messages(req.params.ticket_id as string);
      if (!ticket_data) return res.status(404).json({ message: 'Ticket not found' });
      res.json(ticket_data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}