import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

// 1. ดึงรายชื่อ Staff และ Admin ทั้งหมด (สำหรับหน้า Staff Management)
export const getAllAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        admin_id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
    });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admins" });
  }
};

// 2. สร้าง Admin หรือ Staff ใหม่ (เพิ่มลงตาราง Admin โดยตรง)
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    // เช็คว่า Email ซ้ำในตาราง Admin ไหม
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return res.status(400).json({ message: "Admin email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password || "123456", 10);

    const newAdmin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || "staff", // "admin" หรือ "staff"
      },
    });

    const { password: _, ...adminData } = newAdmin;
    res.status(201).json(adminData);
  } catch (error) {
    res.status(500).json({ message: "Error creating admin" });
  }
};

// 3. แก้ไขข้อมูล Admin/Staff
export const updateAdmin = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, email, role } = req.body;

    const updated = await prisma.admin.update({
      where: { admin_id: id },
      data: { name, email, role },
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
      where: { admin_id: id },
    });

    res.json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting admin" });
  }
};