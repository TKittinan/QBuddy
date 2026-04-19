import { Router } from 'express';
import { AuthController } from './auth_controller';

// นำเข้า middleware สำหรับตรวจสอบ token
import { auth_middleware } from '../../common/auth_middleware';

// นำเข้า multer สำหรับจัดการไฟล์อัปโหลด
import multer from 'multer';

const router = Router();
const auth_controller = new AuthController();

// ตั้งค่า Multer สำหรับเก็บไฟล์ชั่วคราวในหน่วยความจำ (Memory Storage)
const upload = multer({ storage: multer.memoryStorage() });

// Public routes (ไม่ต้องใส่ token ก็เข้าได้)
router.post('/register', auth_controller.register);
router.post('/login', auth_controller.login);
router.post('/forgot-password', auth_controller.forgotPassword);

// Protected routes (ต้องใส่ token ถึงจะใช้งานได้)
// เพิ่ม route สำหรับ logout และใส่ middleware เพื่อให้ดึง user_id ออกมาได้
router.post('/logout', auth_middleware, auth_controller.logout); 

// ใส่ middleware ให้หน้า /me ด้วยเพื่อให้ตรวจสอบ token ก่อนดึงข้อมูล
router.get('/me', auth_middleware, auth_controller.get_me); 

// เพิ่ม route สำหรับอัปเดตข้อมูล Profile
router.put('/update', auth_middleware, auth_controller.updateProfile);

// เพิ่ม route สำหรับอัปเดตรูปโปรไฟล์ (รับไฟล์ผ่าน field ชื่อ 'avatar')
router.put('/update-avatar', auth_middleware, upload.single('avatar'), auth_controller.updateAvatar);

export default router;