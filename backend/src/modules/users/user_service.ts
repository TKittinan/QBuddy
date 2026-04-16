import { prisma } from '../../lib/prisma';
import { RoleType } from '@prisma/client';

export class UserService {
  // ดึงข้อมูล User ทั้งหมด
  async get_all_users() {
    return await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, status: true }
    });
  }

  // ค้นหา User ด้วย ID
  async get_user_by_id(id: string) {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  // สร้าง User ใหม่
  async create_user(data: { name: string; email: string; password?: string; role?: RoleType }) {
    return await prisma.user.create({
      data: {
        ...data,
        status: 'ACTIVE',
      }
    });
  }
}