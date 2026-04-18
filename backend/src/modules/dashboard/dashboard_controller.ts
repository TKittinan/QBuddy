import { Request, Response } from 'express';
import { dashboardService } from './dashboard_service';

export class DashboardController {
  async get_stats(req: Request, res: Response) {
    try {
      const range = (req.query.range as string) || 'Today';
        
      const dashboardData = await dashboardService.get_dashboard_stats(range);
      
      res.json(dashboardData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}