import { Router } from 'express';
import { SavedPlaceController } from './savedplace_controller';

const router = Router();
const saved_place_controller = new SavedPlaceController();

router.get('/:userId', saved_place_controller.getSaved);
router.post('/', saved_place_controller.toggleSave);

export default router;