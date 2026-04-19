import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPasswordService } from '../services/authService'; // สมมติว่าสร้าง service ไว้ 

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // ดึง token จาก URL
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage('รหัสผ่านไม่ตรงกันครับ');
            return;
        }
        if (!token) {
            setMessage('ไม่พบ Token ยืนยันตัวตน (ลิงก์อาจไม่สมบูรณ์)');
            return;
        }

        try {
            // ยิง API ไปหา Backend
            await resetPasswordService(token, newPassword);
            setMessage('เปลี่ยนรหัสผ่านสำเร็จ! กำลังพาท่านไปหน้าเข้าสู่ระบบ...');

            // นำมาใช้งานตรงนี้: รอ 2 วินาทีแล้วค่อยเด้งไปหน้า login
            setTimeout(() => {
                navigate('/login'); // เปลี่ยน '/login' เป็น path หน้าเข้าสู่ระบบของเว็บนาย
            }, 2000);

        } catch (error) {
            setMessage('เกิดข้อผิดพลาด หรือลิงก์หมดอายุแล้ว');
        }
    };

    if (!token) {
        return <div className="p-10 text-center text-red-500">ลิงก์ไม่ถูกต้อง หรือไม่มี Token</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#6FA4A1]">ตั้งรหัสผ่านใหม่</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="password"
                        placeholder="รหัสผ่านใหม่"
                        className="border p-2 rounded"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="ยืนยันรหัสผ่านใหม่"
                        className="border p-2 rounded"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="bg-[#6FA4A1] text-white p-2 rounded hover:bg-[#5b8784] transition"
                    >
                        ยืนยันการเปลี่ยนรหัสผ่าน
                    </button>
                </form>

                {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
            </div>
        </div>
    );
}