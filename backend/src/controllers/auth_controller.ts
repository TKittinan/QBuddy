import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

// ฟังก์ชัน Login สำหรับ Admin Panel (ใช้ตาราง Admin เท่านั้น)
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. ค้นหาจากตาราง Admin โดยตรง (ไม่ต้อง include user แล้วเพราะแยกตารางกันแล้ว)
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    // 2. ตรวจสอบว่ามี Admin อีเมลนี้ไหม
    if (!admin) {
      return res.status(404).json({ message: "Admin account not found" });
    }

    // 3. ตรวจสอบรหัสผ่าน (Hash Comparison)
    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    // 4. สร้าง Token
    // เปลี่ยน userId เป็น adminId เพื่อให้ตรงกับโครงสร้างใหม่
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        role: admin.role 
      },
      "secret", // ต้องตรงกับใน auth_middleware.ts
      { expiresIn: "1d" }
    );

    // 5. ส่งข้อมูลกลับไปที่ Frontend
    res.json({
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role // ค่าจะเป็น "admin" หรือ "staff" ตามที่คุณใส่ใน DB
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed", error });
  }
};

// หมายเหตุ: สำหรับหน้า Admin Panel เรามักจะไม่มีฟังก์ชัน Register สาธารณะ 
// เพราะ Admin/Staff ต้องให้หัวหน้าเพิ่มให้จากระบบหลังบ้านเท่านั้น
// แต่ถ้าคุณอยากมีไว้เพื่อทดสอบ สามารถใช้โค้ดด้านล่างนี้ได้ครับ:

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.admin.create({
      data: {
        email,
        password: hash,
        name,
        role: role || "staff", // กำหนด default เป็น staff ถ้าไม่ส่งมา
      },
    });

    const { password: _, ...adminWithoutPassword } = newAdmin;
    res.status(201).json(adminWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Register failed", error });
  }
};