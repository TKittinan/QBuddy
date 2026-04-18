import { Request, Response } from 'express';
import { TicketService } from './ticket_service';

const ticket_service = new TicketService();

export class TicketController {
  async list_by_place(req: Request, res: Response) {
    try {
      const tickets = await ticket_service.get_tickets_by_place(req.params.place_id as string);
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const new_ticket = await ticket_service.create_ticket(req.body);
      res.status(201).json(new_ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  // 🌟 จุดที่แก้ไข: เปลี่ยนมาใช้ update_ticket เพื่ออัปเดตข้อมูลทั้งหมด (ไม่ใช่แค่ Status)
  async update(req: Request, res: Response) {
    try {
      const updated_ticket = await ticket_service.update_ticket(req.params.id as string, req.body);
      res.json(updated_ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async update_status(req: Request, res: Response) {
    try {
      const updated_ticket = await ticket_service.update_ticket_status(req.params.id as string, req.body.status);
      res.json(updated_ticket);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await ticket_service.delete_ticket(req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async get_status(req: Request, res: Response) {
    try {
      const statusData = await ticket_service.get_queue_status(req.params.id as string);
      res.json(statusData);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
}