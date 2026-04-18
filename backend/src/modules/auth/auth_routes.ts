import { Router } from 'express';
import { AuthController } from './auth_controller';

const router = Router();
const auth_controller = new AuthController();

router.post('/register', auth_controller.register);
router.post('/login', auth_controller.login);
router.post('/forgot-password', auth_controller.forgotPassword);
router.get('/me', auth_controller.get_me); // endpoint สำหรับตรวจสอบ token และดึงข้อมูล user

export default router;