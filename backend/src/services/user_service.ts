import { prisma } from "../lib/prisma";

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    include: {
      admin: true,
    },
  });

  // map เผื่อโชว์ role ออกมาด้วย
  return users.map((u) => ({
    user_id: u.user_id,
    email: u.email,
    name: u.name,
    password: u.password,
    role: u.admin ? u.admin.role : "user",
  }));
};

export const getUserById = async (id: number) => {
  const u = await prisma.user.findUnique({
    where: { user_id: id },
    include: {
      admin: true,
    },
  });

  if (!u) return null;

  return {
    user_id: u.user_id,
    email: u.email,
    name: u.name,
    password: u.password,
    role: u.admin ? u.admin.role : "user",
  };
};

export const deleteUser = (id: number) => {
  return prisma.user.delete({
    where: { user_id: id },
  });
};