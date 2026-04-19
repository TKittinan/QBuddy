import { supabase } from '../../config/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env_config';
import crypto from 'crypto';

export class AuthService {
  async register(data: any) {
    const hashed_password = await bcrypt.hash(data.password, 10);
    
    console.log("กำลังสร้าง User ใหม่ด้วยสถานะ: INACTIVE"); // ใส่ไว้เช็คใน Terminal

    const { data: newUser, error } = await supabase
      .from('User')
      .insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashed_password,
        role: data.role || 'CUSTOMER',
        status: 'INACTIVE' // บังคับส่งค่านี้ไปที่ Supabase เสมอ
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('Email already exists');
      throw new Error(error.message);
    }

    return newUser;
  }

  async login(data: any) {
    const { data: user, error } = await supabase
      .from('User')
      .select('*')
      .eq('email', data.email)
      .single();

    if (error || !user || !user.password) {
      throw new Error('Email or password incorrect');
    }

    const is_match = await bcrypt.compare(data.password, user.password);
    if (!is_match) {
      throw new Error('Email or password incorrect');
    }

    // เมื่อ Login สำเร็จค่อยเปลี่ยนเป็น ACTIVE
    const { error: updateError } = await supabase
      .from('User')
      .update({ status: 'ACTIVE' })
      .eq('id', user.id);

    if (updateError) {
      console.error("Failed to update user status to ACTIVE:", updateError);
    }

    const token = jwt.sign(
      { user_id: user.id, role: user.role },
      ENV.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    const { password, ...userWithoutPassword } = user;
    userWithoutPassword.status = 'ACTIVE';

    return { user: userWithoutPassword, token };
  }

  async logout(userId: string) {
    if (!userId) return;

    const { error } = await supabase
      .from('User')
      .update({ status: 'INACTIVE' })
      .eq('id', userId);

    if (error) {
      console.error("Failed to update user status to INACTIVE:", error);
      throw new Error("Logout failed on server");
    }

    return { success: true };
  }

  async forgotPassword(email: string) {
    const { data: user, error } = await supabase
      .from('User')
      .select('id, email')
      .eq('email', email)
      .single();

    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await supabase
      .from('User')
      .update({
        resetPasswordToken: resetToken,
        resetPasswordExpires: expires
      })
      .eq('id', user.id);

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    console.log(`Reset link for ${email}: ${resetUrl}`);
    // พร้อมสำหรับเชื่อมต่อระบบส่ง Email จริง
  }
}