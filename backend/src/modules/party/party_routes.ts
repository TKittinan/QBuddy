import { Router } from 'express';
import { PartyController } from './party_controller';

const router = Router();
const party_controller = new PartyController();

router.get('/', party_controller.list);
router.post('/', party_controller.create);
router.post('/join', party_controller.join);

export default router;