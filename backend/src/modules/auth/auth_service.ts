import { supabase } from '../../config/supabase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env_config';
import crypto from 'crypto';
import { sendResetPasswordEmail } from '../../common/utils/email_service';

export class AuthService {
  async register(data: any) {
    const hashed_password = await bcrypt.hash(data.password, 10);
    
    console.log("กำลังสร้าง User ใหม่ด้วยสถานะ: INACTIVE");

    const { data: newUser, error } = await supabase
      .from('User')
      .insert([{
        name: data.name,
        email: data.email.toLowerCase(), // บังคับตัวเล็กเสมอ
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
    let query = supabase.from('User').select('*');
    
    if (data.email) {
      query = query.eq('email', data.email);
    } else if (data.phone) {
      query = query.eq('phone', data.phone);
    } else {
      throw new Error('กรุณาระบุอีเมลหรือเบอร์โทรศัพท์');
    }

    const { data: user, error } = await query.single();

    console.log("--------------------------------------------------");
    console.log("🔍 [LOGIN ATTEMPT] สิ่งที่ส่งมา:", data.email || data.phone);
    console.log("🔍 [DB RESULT] หา User เจอไหม?:", user ? "เจอ!" : "ไม่เจอ!");
    if (error) console.log("🔍 [DB ERROR]:", error.message, error.code);
    console.log("--------------------------------------------------");

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('ไม่พบบัญชีนี้ในระบบ หรือพิมพ์ผิดครับ');
      }
      throw new Error(`Database Error: ${error.message}`);
    }

    if (!user) throw new Error('ไม่พบบัญชีผู้ใช้นี้ในระบบ');
    if (!user.password) throw new Error('บัญชีนี้ไม่ได้ตั้งรหัสผ่านไว้');

    let isPasswordValid = false;
    if (!user.password.startsWith('$2')) {
      console.warn(`⚠️ คำเตือน: รหัสของอีเมล ${user.email} เป็น Plain Text ใน Database (ยังไม่ถูก Hash)`);
      isPasswordValid = (data.password === user.password);
    } else {
      isPasswordValid = await bcrypt.compare(data.password, user.password);
    }

    if (!isPasswordValid) {
      throw new Error('รหัสผ่านไม่ถูกต้อง');
    }

    if (user.status === 'BANNED') {
      throw new Error('บัญชีของคุณถูกระงับการใช้งาน');
    }

    await supabase.from('User').update({ status: 'ACTIVE' }).eq('id', user.id);

    const token = jwt.sign(
      { user_id: user.id, email: user.email, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: '24h' }
    );

    delete user.password;
    return { user: { ...user, status: 'ACTIVE' }, token };
  }

  async logout(userId: string) {
    const { error } = await supabase.from('User').update({ status: 'INACTIVE' }).eq('id', userId);
    if (error) throw new Error(`Logout failed: ${error.message}`);
    return { message: "ออกจากระบบสำเร็จ" };
  }

  async get_me(userId: string) {
    const { data: user, error } = await supabase.from('User').select('*').eq('id', userId).single();
    if (error || !user) throw new Error('User not found');
    delete user.password;
    return user;
  }

  async forgotPassword(email: string) {
    const { data: user, error } = await supabase.from('User').select('id, name').eq('email', email).single();
    if (error || !user) throw new Error('ไม่พบอีเมลนี้ในระบบ');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000);

    const { error: updateError } = await supabase
      .from('User')
      .update({ resetPasswordToken: hashedResetToken, resetPasswordExpires: resetTokenExpires.toISOString() })
      .eq('email', email);

    if (updateError) throw new Error('เกิดข้อผิดพลาดในการสร้างรหัสผ่านใหม่');

    const resetUrl = `${ENV.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;
    await sendResetPasswordEmail(email, user.name, resetUrl);
    return { message: 'ลิงก์รีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลของคุณแล้ว' };
  }

  async updateProfile(userId: string, data: any) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.status) updateData.status = data.status;

    const { data: updatedUser, error } = await supabase.from('User').update(updateData).eq('id', userId).select().single();
    if (error) throw new Error(error.message);
    if (updatedUser && updatedUser.password) delete updatedUser.password;
    return updatedUser;
  }

  async updateAvatar(userId: string, file: any) {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file.buffer, { contentType: file.mimetype, upsert: true });
    if (uploadError) throw new Error(`Upload error: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

    const { data: updatedUser, error: dbError } = await supabase.from('User').update({ avatarUrl: publicUrl }).eq('id', userId).select().single();
    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    if (updatedUser && updatedUser.password) delete updatedUser.password;
    return updatedUser;
  }

  async updateAiConsent(userId: string, consented: boolean) {
    // ใช้ชื่อคอลัมน์ให้ตรงกับฐานข้อมูล คือ ai_consented (หรือ aiConsented แล้วแต่กรณี แต่ส่วนใหญ่ Prisma/Supabase จะสร้างเป็น ai_consented)
    const { data: updatedUser, error } = await supabase.from('User').update({ ai_consented: consented }).eq('id', userId).select().single();
    if (error) throw new Error(`Failed to update consent: ${error.message}`);
    if (updatedUser && updatedUser.password) delete updatedUser.password;
    return updatedUser;
  }
}