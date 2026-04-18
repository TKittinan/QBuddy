import { Router } from 'express';
import { TicketController } from './ticket_controller';

const router = Router();
const ticket_controller = new TicketController();

router.get('/place/:place_id', ticket_controller.list_by_place);
router.get('/:id/status', ticket_controller.get_status);         
router.post('/', ticket_controller.create);
router.put('/:id', ticket_controller.update);
router.patch('/:id/status', ticket_controller.update_status);   
router.delete('/:id', ticket_controller.delete);

export default router;