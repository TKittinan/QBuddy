import { Request, Response } from 'express';
import { PlaceService } from './place_service';

const place_service = new PlaceService();

export class PlaceController {
  async list(req: Request, res: Response) { /* ของเดิม */ }
  async get_one(req: Request, res: Response) { /* ของเดิม */ }
  async create(req: Request, res: Response) { /* ของเดิม */ }
  
  async recommend(req: Request, res: Response) {
    try {
      const user_name = req.query.user_name as string;
      const recommendations = await place_service.get_ai_recommendations(user_name || '');
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}