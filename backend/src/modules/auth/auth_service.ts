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
    // 🌟 ปรับให้รองรับการค้นหาทั้ง Email และ Phone
    let query = supabase.from('User').select('*');
    
    if (data.email) {
      query = query.eq('email', data.email);
    } else if (data.phone) {
      query = query.eq('phone', data.phone);
    } else {
      throw new Error('กรุณาระบุอีเมลหรือเบอร์โทรศัพท์');
    }

    const { data: user, error } = await query.single();

    // 🌟 ถ้าค้นหาไม่เจอ (error) หรือไม่มีรหัสผ่าน
    if (error || !user || !user.password) {
      throw new Error('อีเมล/เบอร์โทรศัพท์ หรือรหัสผ่านไม่ถูกต้อง');
    }

    // ตรวจสอบรหัสผ่านที่ถูกเข้ารหัส (Bcrypt)
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('อีเมล/เบอร์โทรศัพท์ หรือรหัสผ่านไม่ถูกต้อง');
    }

    // ตรวจสอบสถานะว่าถูกแบนหรือไม่
    if (user.status === 'BANNED') {
      throw new Error('บัญชีของคุณถูกระงับการใช้งาน');
    }

    // อัปเดตสถานะเป็น ACTIVE เมื่อล็อกอินสำเร็จ
    await supabase
      .from('User')
      .update({ status: 'ACTIVE' })
      .eq('id', user.id);

    // สร้าง JWT Token
    const token = jwt.sign(
      { user_id: user.id, email: user.email, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // ลบรหัสผ่านออกจากออบเจกต์ก่อนส่งกลับไปที่แอป (เพื่อความปลอดภัย)
    delete user.password;
    
    return { user: { ...user, status: 'ACTIVE' }, token };
  }

  async logout(userId: string) {
    // อัปเดตสถานะเป็น INACTIVE เมื่อออกจากระบบ
    const { error } = await supabase
      .from('User')
      .update({ status: 'INACTIVE' })
      .eq('id', userId);

    if (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }

    return { message: "ออกจากระบบสำเร็จ" };
  }

  async get_me(userId: string) {
    const { data: user, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    delete user.password; // ลบรหัสผ่านก่อนส่งกลับ
    return user;
  }

  async forgotPassword(email: string) {
    // 1. ตรวจสอบว่ามีอีเมลนี้ในระบบหรือไม่
    const { data: user, error } = await supabase
      .from('User')
      .select('id, name')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('ไม่พบอีเมลนี้ในระบบ');
    }

    // 2. สร้าง Token สุ่มสำหรับ Reset Password
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 นาที

    // 3. บันทึก Token ลงใน Database
    const { error: updateError } = await supabase
      .from('User')
      .update({ 
        resetPasswordToken: hashedResetToken, 
        resetPasswordExpires: resetTokenExpires.toISOString()
      })
      .eq('email', email);

    if (updateError) {
      throw new Error('เกิดข้อผิดพลาดในการสร้างรหัสผ่านใหม่');
    }

    // 4. ส่งอีเมล (ใส่ URL ของหน้า Reset Password ฝั่ง Frontend)
    const resetUrl = `${ENV.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;
    await sendResetPasswordEmail(email, user.name, resetUrl);

    return { message: 'ลิงก์รีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลของคุณแล้ว' };
  }

  // ฟังก์ชันใหม่สำหรับแก้ไขข้อมูลส่วนตัว (ยกเว้นรหัสผ่าน และรูปภาพ)
  async updateProfile(userId: string, data: any) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.status) updateData.status = data.status; // เผื่อต้องการอัปเดตสถานะ

    const { data: updatedUser, error } = await supabase
      .from('User')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // ตัดรหัสผ่านทิ้งก่อนส่งกลับ
    if (updatedUser && updatedUser.password) {
      delete updatedUser.password;
    }

    return updatedUser;
  }

  // ฟังก์ชันใหม่สำหรับอัปโหลดและเปลี่ยนรูปโปรไฟล์
  async updateAvatar(userId: string, file: any) {
    // 1. ตั้งชื่อไฟล์ใหม่ให้ไม่ซ้ำกัน
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