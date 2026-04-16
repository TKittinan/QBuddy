import { Request, Response } from "express";
import * as userService from "../services/user_service";

// 1. ดึงข้อมูล User ทั้งหมด
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// 2. ดึงข้อมูล User ตาม ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id); // หรือใช้ String ถ้า id ใน DB เป็น UUID
    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};

// 3. สร้าง User ใหม่ (เพิ่มเข้ามา)
export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    // ส่งข้อมูลไปให้ service จัดการสร้างใน Database
    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

// 4. แก้ไขข้อมูล User (เพิ่มเข้ามา)
export const updateUser = async (req: Request, res: Response) => {
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
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await userService.deleteUser(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};