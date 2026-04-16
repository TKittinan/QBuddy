import { Router } from 'express';
import { SupportController } from './support_controller';

const router = Router();
const support_controller = new SupportController();

router.post('/tickets', support_controller.create_ticket);
router.post('/messages', support_controller.post_message);
router.get('/tickets/:ticket_id/messages', support_controller.get_messages);

export default router;