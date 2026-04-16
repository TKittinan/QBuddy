import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

// --- LOGIN ---
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(404).json({ message: "Admin account not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, admin.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    // อัปเดตสถานะเป็น ONLINE เมื่อ Login สำเร็จ
    const updatedAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data: { status: "ONLINE" },
    });

    const adminRole = updatedAdmin.role ? updatedAdmin.role.toLowerCase() : "staff";

    const token = jwt.sign(
      { 
        adminId: updatedAdmin.id, 
        role: adminRole 
      },
      "secret", 
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: updatedAdmin.id, 
        email: updatedAdmin.email,
        name: updatedAdmin.name,
        role: adminRole,
        status: updatedAdmin.status
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed", error });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { adminId } = req.body; // รับ ID จากหน้าบ้านตอนกด Sign Out

    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required for logout" });
    }

    // อัปเดตสถานะกลับเป็น OFFLINE ในฐานข้อมูล
    await prisma.admin.update({
      where: { id: Number(adminId) },
      data: { status: "OFFLINE" },
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Logout failed", error });
  }
};

// --- REGISTER ---
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
        role: role ? role.toLowerCase() : "staff", 
        status: "OFFLINE", // เริ่มต้นเป็น Offline เสมอ
      },
    });

    const { password: _, ...adminWithoutPassword } = newAdmin;
    res.status(201).json(adminWithoutPassword);
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Register failed", error });
  }
};