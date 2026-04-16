import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env_config';


export class AuthService {
  async register(data: any) {
    // 1. เข้ารหัสรหัสผ่านก่อนบันทึก
    const hashed_password = await bcrypt.hash(data.password, 10);
    
    return await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed_password,
        role: data.role || 'CUSTOMER'
      }
    });
  }

  async login(data: any) {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user || !user.password) {
      throw new Error('Email or password incorrect');
    }

    const is_match = await bcrypt.compare(data.password, user.password);
    if (!is_match) {
      throw new Error('Email or password incorrect');
    }

    // 2. เปลี่ยนมาใช้ ENV.JWT_SECRET ตรงนี้ครับ
    const token = jwt.sign(
      { user_id: user.id, role: user.role },
      ENV.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    return { user, token };
  }
}