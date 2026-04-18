import nodemailer from 'nodemailer';

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // หรือใช้อีเมลค่ายอื่นที่นายมี
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: '"QBuddy Support" <support@qbuddy.com>',
    to: email,
    subject: 'Reset Your Password - QBuddy',
    html: `<p>คุณได้ทำการขอเปลี่ยนรหัสผ่าน</p>
           <p>กรุณาคลิกลิงก์ด้านล่างเพื่อดำเนินการต่อ (ลิงก์มีอายุ 1 ชม.):</p>
           <a href="${resetUrl}">${resetUrl}</a>`,
  });
};