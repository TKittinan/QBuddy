import axios from 'axios';
import { API_BASE_URL } from '../config'; // ดึง URL ของ Backend มา

export const resetPasswordService = async (token: string, newPassword: string) => {
  // ฝั่ง Backend ต้องมี Endpoint รับค่าตรงนี้นะครับ (เช่น POST /api/auth/reset-password)
  const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
    token,
    newPassword,
  });
  return response.data;
};