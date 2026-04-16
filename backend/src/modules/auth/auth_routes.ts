import { Router } from 'express';
import { AuthController } from './auth_controller';

const router = Router();
const auth_controller = new AuthController();

router.post('/register', auth_controller.register);
router.post('/login', auth_controller.login);

export default router;