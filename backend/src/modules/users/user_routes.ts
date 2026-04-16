import { Router } from 'express';
import { UserController } from './user_controller';

const router = Router();
const user_controller = new UserController();

router.get('/', user_controller.list);
router.get('/:id', user_controller.get_one);
router.post('/', user_controller.create);

export default router;