import { prisma } from "../lib/prisma";

export const getAllUsers = () => {
  return prisma.user.findMany();
};

export const getUserById = (id: number) => {
  return prisma.user.findUnique({
    where: { user_id: id },
  });
};

export const deleteUser = (id: number) => {
  return prisma.user.delete({
    where: { user_id: id },
  });
};