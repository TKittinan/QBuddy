import { prisma } from "../lib/prisma";

// 1. ดึงข้อมูล User ทั้งหมดพร้อม Role
export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    include: {
      admin: true,
    },
  });

  return users.map((u) => ({
    id: u.user_id, // ปรับชื่อ key ให้ตรงกับ Frontend (id)
    email: u.email,
    name: u.name,
    role: u.admin ? u.admin.role : "CUSTOMER",
    status: "ACTIVE", // หรือดึงจาก field ใน DB ถ้ามี
    createdAt: new Date().toLocaleDateString(), 
  }));
};

// 2. ดึงข้อมูล User รายบุคคล
export const getUserById = async (id: number) => {
  const u = await prisma.user.findUnique({
    where: { user_id: id },
    include: {
      admin: true,
    },
  });

  if (!u) return null;

  return {
    id: u.user_id,
    email: u.email,
    name: u.name,
    role: u.admin ? u.admin.role : "CUSTOMER",
  };
};

// 3. สร้าง User ใหม่ (เพิ่มเข้ามา)
export const createUser = async (data: any) => {
  return await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: data.password || "123456", // ควรมีการ Hash password ก่อนบันทึก
      // ถ้ามี field อื่นๆ เช่น avatarUrl ให้ใส่ตรงนี้
    },
  });
};

// 4. แก้ไขข้อมูล User (เพิ่มเข้ามา)
export const updateUser = async (id: number, data: any) => {
  return await prisma.user.update({
    where: { user_id: id },
    data: {
      email: data.email,
      name: data.name,
      // เพิ่ม field อื่นๆ ที่ต้องการอัปเดต
    },
  });
};

// 5. ลบ User
export const deleteUser = async (id: number) => {
  return await prisma.user.delete({
    where: { user_id: id },
  });
};