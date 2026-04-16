import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

// 1. ดึงรายชื่อ Staff และ Admin ทั้งหมด
export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true, // แก้จาก admin_id เป็น id ให้ตรงกับ Migration
        name: true,
        email: true,
        role: true,
        status: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admins" });
  }
};

// 2. สร้าง Admin หรือ Staff ใหม่
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(400).json({ message: "Email นี้ถูกใช้งานไปแล้ว" });
    }

    // เข้ารหัสผ่านก่อนบันทึก
    const hashedPassword = await bcrypt.hash(password || "123456", 10);

    const newAdmin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role ? role.toLowerCase() : "staff", 
      },
    });

    const { password: _, ...adminData } = newAdmin;
    res.status(201).json(adminData);
  } catch (error) {
    console.error("Create Admin Error:", error);
    res.status(500).json({ message: "Failed to add staff" });
  }
};

// 3. แก้ไขข้อมูล Admin/Staff
export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id); // รับค่าจาก URL parameter
    const { name, email, role } = req.body;

    const updated = await prisma.admin.update({
      where: { id: id }, // แก้จาก admin_id เป็น id
      data: { 
        name, 
        email, 
        role: role ? role.toLowerCase() : undefined 
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating admin" });
  }
};

// 4. ลบ Admin/Staff ออกจากระบบ
export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.admin.delete({
      where: { id: id }, // แก้จาก admin_id เป็น id
    });

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting admin" });
  }
};