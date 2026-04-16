import { Request, Response } from 'express';
import { TicketService } from './ticket_service';

const ticket_service = new TicketService();

export class TicketController {
  async list_by_place(req: Request, res: Response) {
    try {
      const tickets = await ticket_service.get_tickets_by_place(req.query.place_id as string);
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

  async update_status(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const updated = await ticket_service.update_ticket_status(req.params.id as string, status);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}