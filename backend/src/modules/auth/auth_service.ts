import { supabase } from '../../config/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env_config';

export class AuthService {
  async register(data: any) {
    // 1. เข้ารหัสรหัสผ่านก่อนบันทึก
    const hashed_password = await bcrypt.hash(data.password, 10);
    
    const { data: newUser, error } = await supabase
      .from('users') // ตรวจสอบว่าชื่อตารางใน Supabase คือ users
      .insert([{
        name: data.name,
        email: data.email,
        password: hashed_password,
        role: data.role || 'CUSTOMER',
        status: 'ACTIVE' // เพิ่มสถานะเริ่มต้นตามที่เคยทำใน UserService
      }])
      .select()
      .single();

    if (error) {
      // เช็คกรณี email ซ้ำ (Duplicate key)
      if (error.code === '23505') throw new Error('Email already exists');
      throw new Error(error.message);
    }

    return newUser;
  }

  async login(data: any) {
    // ดึงข้อมูล User จาก email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', data.email)
      .single();

    // ถ้าไม่เจอ user หรือเกิด error (เช่น หาไม่เจอ single จะ return error)
    if (error || !user || !user.password) {
      throw new Error('Email or password incorrect');
    }

    // ตรวจสอบรหัสผ่าน
    const is_match = await bcrypt.compare(data.password, user.password);
    if (!is_match) {
      throw new Error('Email or password incorrect');
    }

    // 2. สร้าง Token โดยใช้ ENV.JWT_SECRET
    const token = jwt.sign(
      { user_id: user.id, role: user.role },
      ENV.JWT_SECRET, // ตรวจสอบว่าในไฟล์ env_config ใช้ ENV หรือ env (จากโค้ดเดิมนายใช้ ENV)
      { expiresIn: '1d' }
    );

    // ลบรหัสผ่านออกจาก object ก่อนส่งกลับ (เพื่อความปลอดภัย)
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }
}