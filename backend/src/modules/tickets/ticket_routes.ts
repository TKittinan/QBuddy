import { Router } from 'express';
import { TicketController } from './ticket_controller';

const router = Router();
const ticket_controller = new TicketController();

router.get('/active-bookings', ticket_controller.get_active_bookings);
router.get('/booked-slots', ticket_controller.get_booked_slots);
router.get('/place/:place_id', ticket_controller.list_by_place);
router.get('/:id/status', ticket_controller.get_status);         
router.post('/', ticket_controller.create);
router.put('/:id', ticket_controller.update);
router.patch('/:id/status', ticket_controller.update_status);   
router.delete('/:id', ticket_controller.delete);

export default router;