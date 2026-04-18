import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env_config';

export const auth_middleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]; // ดึงจาก "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    (req as any).user = decoded; // เก็บข้อมูล user ไว้ใน request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};