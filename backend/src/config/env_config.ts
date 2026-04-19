import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_if_not_found',
  PORT: process.env.PORT || 3000,

  // เพิ่มค่าสำหรับการส่งอีเมลรีเซ็ตรหัสผ่าน
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  
  // เพิ่มค่า URL สำหรับลิงก์ที่อยู่ในอีเมล
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://qbuddy-admin.vercel.app/login',

  // เพิ่มค่า Supabase สำหรับความปลอดภัย (ถ้าต้องการใช้ผ่าน ENV)
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};