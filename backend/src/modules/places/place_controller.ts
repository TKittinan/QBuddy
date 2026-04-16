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
}