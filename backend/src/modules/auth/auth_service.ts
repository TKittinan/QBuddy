import { supabase } from '../../config/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env_config';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '../../common/utils/email_service';

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
  console.log("--- มีการร้องขอ Forgot Password สำหรับเมล: ", email);
    const { data: user, error } = await supabase
      .from('User')
      .select('id, email, name')
      .eq('email', email)
      .single();

    // จุดแก้ไข 1: ถ้าไม่พบ User ต้องบอกให้ Controller รู้
    if (!user) {
      throw new Error("User not found");
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    const { error: updateError } = await supabase
      .from('User')
      .update({
        resetPasswordToken: resetToken,
        resetPasswordExpires: expires
      })
      .eq('id', user.id);

    if (updateError) throw new Error("Failed to update reset token");

    // จุดแก้ไข 2: ส่งอีเมลจริงผ่าน Service
    // หมายเหตุ: URL ควรเปลี่ยนจาก localhost เป็น IP เครื่องนาย เพื่อให้กดจากมือถือได้
    const resetUrl = `${ENV.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    try {
      await sendResetPasswordEmail(user.email, user.name, resetUrl);
      console.log(`Reset email sent to: ${email}`);
    } catch (mailError) {
      console.error("Mail service error:", mailError);
      throw new Error("Failed to send email");
    }
  }
}