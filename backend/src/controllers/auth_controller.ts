import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

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

    const adminRole = admin.role ? admin.role.toUpperCase() : "STAFF";

    const token = jwt.sign(
      { 
        adminId: admin.id, 
        role: adminRole 
      },
      "secret", 
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: admin.id, 
        email: admin.email,
        name: admin.name,
        role: adminRole 
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed", error });
  }
};

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
        role: role ? role.toUpperCase() : "STAFF", // บังคับตัวใหญ่ตอนสมัคร
      },
    });

    const { password: _, ...adminWithoutPassword } = newAdmin;
    res.status(201).json(adminWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Register failed", error });
  }
};