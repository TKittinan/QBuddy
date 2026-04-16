import { Request, Response } from 'express';
import { SettingsService } from './settings_service';

const settings_service = new SettingsService();

export class SettingsController {
  async get(req: Request, res: Response) {
    try {
      const settings = await settings_service.get_settings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const updated = await settings_service.update_settings(req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}