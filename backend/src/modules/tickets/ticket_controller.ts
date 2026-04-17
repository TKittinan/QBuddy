import { Request, Response } from 'express';
import { TicketService } from './ticket_service';

const ticket_service = new TicketService();

export class TicketController {
  // ดึงคิวทั้งหมดของร้านค้า
  async list_by_place(req: Request, res: Response) {
    try {
      const tickets = await ticket_service.get_tickets_by_place(req.params.place_id as string);
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // จองคิวใหม่
  async create(req: Request, res: Response) {
    try {
      const new_ticket = await ticket_service.create_ticket(req.body);
      res.status(201).json(new_ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // อัปเดตสถานะคิว (เช่น เรียกคิว หรือ ยกเลิก)
  async update_status(req: Request, res: Response) {
    try {
      const updated_ticket = await ticket_service.update_ticket_status(
        req.params.id as string,
        req.body.status
      );
      res.json(updated_ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // ดูสถานะคิวปัจจุบันและการคำนวณเวลา (อันนี้ของเดิมที่นายเขียนไว้)
  async get_status(req: Request, res: Response) {
    try {
      const statusData = await ticket_service.get_queue_status(req.params.id as string);
      res.json(statusData);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  // เพิ่มฟังก์ชันลบ Ticket (เพื่อให้ลบข้อมูลที่ผิดพลาดได้)
  async delete(req: Request, res: Response) {
    try {
      await ticket_service.delete_ticket(req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}