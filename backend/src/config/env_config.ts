import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_if_not_found',
  PORT: process.env.PORT || 3000,
  // อนาคตเพิ่มค่าอื่นๆ เช่น API_KEY ตรงนี้ได้เลย
};