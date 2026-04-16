import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

// 1. ดึงข้อมูล User (ลูกค้า) ทั้งหมด
export const getAllUsers = async () => {
  // แก้ไข: ลบ include: { admin: true } ออก เพราะแยกตารางกันแล้ว
  const users = await prisma.user.findMany({
    orderBy: {
      user_id: 'desc' // ให้ข้อมูลใหม่ขึ้นก่อน
    }
  });

  return users.map((u) => ({
    id: u.user_id,
    email: u.email,
    name: u.name,
    role: "CUSTOMER", // บังคับเป็น CUSTOMER ทันทีเพราะมาจากตาราง User
    status: "ACTIVE",
    createdAt: new Date().toLocaleDateString(), 
  }));
};

// 2. ดึงข้อมูล User (ลูกค้า) รายบุคคล
export const getUserById = async (id: number) => {
  const u = await prisma.user.findUnique({
    where: { user_id: id },
    // แก้ไข: ลบ include admin ออก
  });

  if (!u) return null;

  return {
    id: u.user_id,
    email: u.email,
    name: u.name,
    role: "CUSTOMER",
  };
};

// 3. สร้าง User ใหม่ (สำหรับลูกค้า)
export const createUser = async (data: any) => {
  // เพิ่มการ Hash Password ก่อนบันทึกเพื่อความปลอดภัย
  const hashedPassword = await bcrypt.hash(data.password || "123456", 10);
  
  return await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword, // ใช้ password ที่ hash แล้ว
    },
  });
};

// 4. แก้ไขข้อมูล User (ลูกค้า)
export const updateUser = async (id: number, data: any) => {
  return await prisma.user.update({
    where: { user_id: id },
    data: {
      email: data.email,
      name: data.name,
      // ถ้ามีการเปลี่ยน password ให้ hash ใหม่ตรงนี้ด้วย
    },
  });
};

// 5. ลบ User
export const deleteUser = async (id: number) => {
  return await prisma.user.delete({
    where: { user_id: id },
  });
};