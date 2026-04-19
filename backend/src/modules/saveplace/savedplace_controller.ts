import { Request, Response } from 'express';
import { SavedPlaceService } from './savedplace_service';

const saved_place_service = new SavedPlaceService();

export class SavedPlaceController {
  async getSaved(req: Request, res: Response) {
    try {
      const userId = req.params.userId as string;
      const places = await saved_place_service.getSavedPlaces(userId);
      res.json(places);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async toggleSave(req: Request, res: Response) {
    try {
      const { userId, placeId } = req.body;
      if (!userId || !placeId) {
        return res.status(400).json({ message: 'userId and placeId are required' });
      }
      const result = await saved_place_service.toggleSavePlace(userId, placeId);
      res.json({ data: result });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}