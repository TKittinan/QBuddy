import nodemailer from 'nodemailer';
import { ENV } from '../../config/env_config';

export const sendResetPasswordEmail = async (email: string, name: string, resetUrl: string) => {
  // ลอง Log เช็คค่าดูก่อนรัน (ลบออกได้ตอนใช้งานจริง)
  console.log("พยายามส่งเมลจาก:", ENV.EMAIL_USER);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: ENV.EMAIL_USER, 
      pass: ENV.EMAIL_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"QBuddy Support" <${ENV.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - QBuddy',
      html: `
        <div style="font-family: sans-serif; line-height: 1.6;">
          <h2>สวัสดีคุณ ${name}</h2>
          <p>คุณได้รับอีเมลนี้เนื่องจากมีการร้องขอรีเซ็ตรหัสผ่านสำหรับบัญชี QBuddy ของคุณ</p>
          <div style="margin: 20px 0;">
            <a href="${resetUrl}" 
               style="background-color: #6FA4A1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
               รีเซ็ตรหัสผ่านของฉัน
            </a>
          </div>
          <p>หากปุ่มใช้งานไม่ได้ กรุณาคัดลอกลิงก์นี้:</p>
          <p>${resetUrl}</p>
        </div>
      `,
    });
    console.log("ส่งเมลสำเร็จแล้ว! Message ID:", info.messageId);
    return info;
  } catch (error) {
    // ถ้าพลาด ตรงนี้จะโชว์ใน Terminal เลยว่าพลาดเพราะอะไร (เช่น รหัสผ่านผิด หรือโดน Google บล็อก)
    console.error("เกิดข้อผิดพลาดในการส่งเมล:", error);
    throw error; 
  }
};