import { Request, Response } from 'express';
import { PlaceService } from './place_service';

const place_service = new PlaceService();

export class PlaceController {
  async list(req: Request, res: Response) {
    try {
      const places = await place_service.get_all_places();
      res.json(places);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async get_one(req: Request, res: Response) {
    try {
      const place = await place_service.get_place_by_id(req.params.id as string);
      if (!place) return res.status(404).json({ message: 'Place not found' });
      res.json(place);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const new_place = await place_service.create_place(req.body);
      res.status(201).json(new_place);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
  
  // ฟังก์ชัน Recommend ที่เพื่อนคุณเพิ่มเข้ามา (คงไว้ตามเดิม 100%)
  async recommend(req: Request, res: Response) {
    try {
      const user_name = req.query.user_name as string;
      const recommendations = await place_service.get_ai_recommendations(user_name || '');
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // --- เพิ่มให้เพื่อให้รองรับปุ่ม Edit/Delete จากฝั่ง Frontend ---
  
  async update(req: Request, res: Response) {
    try {
      const updated_place = await place_service.update_place((req.params.id as string), req.body);
      res.json(updated_place);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await place_service.delete_place(req.params.id as string);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}