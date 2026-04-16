import { Router } from 'express';
import { TicketController } from './ticket_controller';

const router = Router();
const ticket_controller = new TicketController();

router.get('/', ticket_controller.list_by_place);
router.post('/', ticket_controller.create);
router.patch('/:id/status', ticket_controller.update_status); 
router.get('/:id/status', ticket_controller.get_status); 

export default router;