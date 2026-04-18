import { supabase } from '../../config/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env_config';
import crypto from 'crypto'; // เพิ่มสำหรับสร้าง Token สุ่ม

export class AuthService {
  async register(data: any) {
    const hashed_password = await bcrypt.hash(data.password, 10);
    
    const { data: newUser, error } = await supabase
      .from('User')
      .insert([{
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashed_password,
        role: data.role || 'CUSTOMER',
        status: 'INACTIVE'
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
    const { error: updateError } = await supabase
      .from('User')
      .update({ status: 'ACTIVE' })
      .eq('id', user.id);

    if (updateError) {
      console.error("Failed to update user status:", updateError);
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

  // Logic สำหรับจัดการลืมรหัสผ่าน
  async forgotPassword(email: string) {
    // 1. หา User จากอีเมล
    const { data: user, error } = await supabase
      .from('User')
      .select('id, email')
      .eq('email', email)
      .single();

    // ถ้าไม่เจอ User เราจะไม่ Throw error เพื่อความปลอดภัย (Security)
    if (!user) return;

    // 2. สร้าง Token สุ่ม (ใช้ crypto) และตั้งเวลาหมดอายุ (เช่น 1 ชั่วโมง)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // หมดอายุใน 1 ชม.

    // 3. บันทึกลง Supabase ในคอลัมน์ที่นายเพิ่งสร้าง
    const { error: updateError } = await supabase
      .from('User')
      .update({
        resetPasswordToken: resetToken,
        resetPasswordExpires: expires
      })
      .eq('id', user.id);

    if (updateError) throw new Error("Failed to set reset token");

    // 4. ส่งอีเมล (อันนี้คือจุดที่นายต้องใช้ service ส่งเมล เช่น Resend หรือ Nodemailer)
    // ผมทำตัวอย่างการสร้าง Link ให้ครับ
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
    
    console.log(`Email sent to ${email} with link: ${resetUrl}`);
    
    // TODO: นายต้องเรียกฟังก์ชันส่งอีเมลจริงตรงนี้
    // await emailService.send(email, "Reset Password", `คลิกที่นี่เพื่อเปลี่ยนรหัส: ${resetUrl}`);
  }
}