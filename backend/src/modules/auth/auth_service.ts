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

  // ฟังก์ชันสำหรับอัปเดต Profile
  async updateProfile(userId: string, updateData: any) {
    if (!userId) throw new Error("User ID is required");

    const updates: any = {};
    
    // ตรวจสอบว่ามีการส่งฟิลด์ไหนมาบ้าง แล้วจัดเตรียมข้อมูลสำหรับอัปเดต
    if (updateData.name) updates.name = updateData.name;
    if (updateData.email) updates.email = updateData.email;
    
    // ถ้ายูสเซอร์ส่งรหัสผ่านใหม่มา ต้องจับไปเข้ารหัส (Hash) ก่อนบันทึกลง Database
    if (updateData.password) {
      updates.password = await bcrypt.hash(updateData.password, 10);
    }

    const { data: updatedUser, error } = await supabase
      .from('User')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      // ดักจับกรณีที่ยูสเซอร์เปลี่ยนอีเมลไปซ้ำกับคนอื่นในระบบ
      if (error.code === '23505') throw new Error('อีเมลนี้มีผู้ใช้งานแล้ว');
      throw new Error(error.message);
    }

    // ตัดรหัสผ่านทิ้งก่อนส่งข้อมูลกลับไปให้หน้าแอปมือถือ
    if (updatedUser && updatedUser.password) {
      delete updatedUser.password;
    }

    return updatedUser;
  }

  // ฟังก์ชันใหม่สำหรับจัดการการอัปโหลดรูปโปรไฟล์ไปยัง Storage
  async updateAvatar(userId: string, file: any) {
    if (!userId) throw new Error("User ID is required");

    // 1. กำหนดชื่อไฟล์ใหม่ (สุ่มเพื่อไม่ให้ซ้ำ)
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // 2. อัปโหลดไฟล์ไปยัง Supabase Storage Bucket ชื่อ 'avatars'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw new Error(`Upload error: ${uploadError.message}`);

    // 3. ดึง Public URL ของไฟล์ที่เพิ่งอัปโหลด
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // 4. อัปเดตฟิลด์ avatarUrl ในตาราง User
    const { data: updatedUser, error: dbError } = await supabase
      .from('User')
      .update({ avatarUrl: publicUrl })
      .eq('id', userId)
      .select()
      .single();

    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    // ตัดรหัสผ่านทิ้งก่อนส่งกลับ
    if (updatedUser && updatedUser.password) {
      delete updatedUser.password;
    }

    return updatedUser;
  }
}