import { prisma } from "../lib/prisma";

// ดึง category ทั้งหมด
export const getCategories = async () => {
  return prisma.category.findMany();
};

// สร้าง category
export const createCategory = async (data: any) => {
  return prisma.category.create({
    data,
  });
};

// ลบ category
export const deleteCategory = async (id: number) => {
  return prisma.category.delete({
    where: {
      category_id: id,
    },
  });
};