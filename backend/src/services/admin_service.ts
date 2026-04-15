import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

// 1. ดึงรายชื่อเจ้าหน้าที่ทั้งหมด
export const getAllAdmins = async () => {
  return await prisma.admin.findMany({
    select: {
      admin_id: true,
      name: true,
      email: true,
      role: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  });
};

// 2. สร้างเจ้าหน้าที่ใหม่ (Admin/Staff)
export const createAdmin = async (data: any) => {
  const hashedPassword = await bcrypt.hash(data.password || "123456", 10);
  
  return await prisma.admin.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: data.role || "staff",
    },
  });
};

// 3. แก้ไขข้อมูลเจ้าหน้าที่
export const updateAdmin = async (id: number, data: any) => {
  return await prisma.admin.update({
    where: { admin_id: id },
    data: {
      email: data.email,
      name: data.name,
      role: data.role,
    },
  });
};

// 4. ลบเจ้าหน้าที่
export const deleteAdmin = async (id: number) => {
  return await prisma.admin.delete({
    where: { admin_id: id },
  });
};