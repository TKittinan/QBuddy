import { Request, Response } from 'express';
import { TicketService } from './ticket_service';

const ticket_service = new TicketService();

export class TicketController {
  async list_by_place(req: Request, res: Response) { /* ของเดิม */ }
  async create(req: Request, res: Response) { /* ของเดิม */ }
  async update_status(req: Request, res: Response) { /* ของเดิม */ }

  async get_status(req: Request, res: Response) {
    try {
      const statusData = await ticket_service.get_queue_status(req.params.id as string);
      res.json(statusData);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
}