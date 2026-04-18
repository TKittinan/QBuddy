import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env_config';

// สร้าง Interface เพื่อกำหนดโครงสร้างของข้อมูลใน Token ให้ชัดเจน
interface AuthRequest extends Request {
  user?: {
    user_id: string;
    role: string;
  };
}

export const auth_middleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // ระบุ Type ให้กับผลลัพธ์ของ jwt.verify
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { user_id: string; role: string };
    
    // เก็บข้อมูลลงใน req.user ตาม Interface ที่เราสร้างไว้
    req.user = decoded; 
    
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};