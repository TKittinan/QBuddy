import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // เช็คว่ามี email นี้หรือยัง
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        name,
      },
    });

    // ไม่ควรส่ง password กลับไปที่ frontend
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Register failed", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // ค้นหา user พร้อมข้อมูลในตาราง admin เพื่อเช็ค Role
    const user = await prisma.user.findFirst({
      where: { email },
      include: { admin: true } // ดึงข้อมูลจากตาราง admin มาด้วย
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Wrong password" });

    // สร้าง Token ให้ตรงกับที่ authMiddleware ต้องการ (คีย์ userId)
    // และใช้ "secret" ให้ตรงกับใน middleware
    
    const token = jwt.sign(
      { 
        userId: user.user_id,
        role: user.admin ? user.admin.role : "USER" 
      },
      "secret",
      { expiresIn: "1d" } // เพิ่มเวลาหมดอายุของ Token เพื่อความปลอดภัย
    );

    // ส่งทั้ง Token และข้อมูลพื้นฐานของ User กลับไป
    res.json({
      token,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        role: user.admin ? user.admin.role : "USER"
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};