import { Router } from 'express';
import { TicketController } from './ticket_controller';

const router = Router();
const ticket_controller = new TicketController();

router.get('/tickets/place/:place_id', ticket_controller.list_by_place);
router.get('/tickets/:id/status', ticket_controller.get_status);         
router.post('/tickets', ticket_controller.create);
router.patch('/tickets/:id/status', ticket_controller.update_status);   
router.delete('/tickets/:id', ticket_controller.delete);

export default router;