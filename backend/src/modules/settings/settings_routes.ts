import { Router } from 'express';
import { SettingsController } from './settings_controller';

const router = Router();
const settings_controller = new SettingsController();

router.get('/', settings_controller.get);
router.patch('/', settings_controller.update);
router.post('/', settings_controller.update);
router.put('/', settings_controller.update);

export default router;