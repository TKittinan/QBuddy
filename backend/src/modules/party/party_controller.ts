import { Request, Response } from 'express';
import { PartyService } from './party_service';

const party_service = new PartyService();

export class PartyController {
  async list(req: Request, res: Response) {
    try {
      // Extract user location from query parameters
      const { lat, lng, userId } = req.query;
      const userLat = lat ? parseFloat(lat as string) : undefined;
      const userLng = lng ? parseFloat(lng as string) : undefined;

      const parties = await party_service.get_all_parties(userLat, userLng, userId as string | undefined);
      res.json(parties);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const new_party = await party_service.create_party(req.body);
      res.status(201).json(new_party);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async join(req: Request, res: Response) {
    try {
      const guest = await party_service.join_party(req.body);
      res.status(201).json(guest);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}