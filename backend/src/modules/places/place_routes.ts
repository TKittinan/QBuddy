import { Router } from 'express';
import { PlaceController } from './place_controller';

const router = Router();
const place_controller = new PlaceController();

router.get('/places', place_controller.list);
router.get('/places/recommend', place_controller.recommend);
router.get('/places/:id', place_controller.get_one);
router.post('/places', place_controller.create);
router.put('/places/:id', place_controller.update);
router.delete('/places/:id', place_controller.delete);

export default router;