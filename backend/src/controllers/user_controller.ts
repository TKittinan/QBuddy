import { Request, Response } from "express";
import * as userService from "../services/user_service";
import { AuthRequest } from "../middlewares/auth_middleware"; // นำเข้า Interface ที่เราแก้เมื่อกี้

// 1. ดึงข้อมูล User (ลูกค้า) ทั้งหมด
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    // ดึงข้อมูลจาก service ซึ่งตอนนี้ควรจะชี้ไปที่ prisma.user แล้ว
    const users = await userService.getAllUsers();
    
    // เติม role: "CUSTOMER" และ status ให้ฝั่ง Frontend แสดงผลได้ถูกต้อง
    const formattedUsers = users.map((u: any) => ({
      ...u,
      role: "CUSTOMER", // บังคับเป็น Customer เพราะมาจากตาราง User
      status: "Active"  // หรือใส่ Logic ตรวจสอบสถานะจริงที่มีใน DB
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// 2. ดึงข้อมูล User ตาม ID
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // เติม role ให้เหมือนกันเพื่อความสม่ำเสมอของข้อมูล
    const formattedUser = {
      ...user,
      role: "CUSTOMER"
    };

    res.status(200).json(formattedUser);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};

// 3. สร้าง User ใหม่ (ลูกค้า)
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const userData = req.body;
    // หมายเหตุ: อย่าลืมทำ Hash Password ใน user_service ก่อนบันทึกลงตาราง User ด้วยนะครับ
    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

// 4. แก้ไขข้อมูล User
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updateData = req.body;
    
    const updatedUser = await userService.updateUser(id, updateData);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

// 5. ลบ User
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    await userService.deleteUser(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};