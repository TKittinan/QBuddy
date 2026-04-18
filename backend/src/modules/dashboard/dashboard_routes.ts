import { Router } from 'express';
import { DashboardController } from './dashboard_controller';

const router = Router();
const dashboard_controller = new DashboardController();

router.get('/stats', dashboard_controller.get_stats);

export default router;