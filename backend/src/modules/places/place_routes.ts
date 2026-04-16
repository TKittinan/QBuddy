import { Router } from 'express';
import { PlaceController } from './place_controller';

const router = Router();
const place_controller = new PlaceController();

router.get('/', place_controller.list);
router.get('/recommend', place_controller.recommend);
router.get('/:id', place_controller.get_one);
router.post('/', place_controller.create);

export default router;