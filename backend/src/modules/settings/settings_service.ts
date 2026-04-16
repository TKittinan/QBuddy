import { prisma } from '../../lib/prisma';

export class SettingsService {
  // ดึงค่าการตั้งค่าทั้งหมด (สมมติว่าใช้ ID: 1 เสมอ)
  async get_settings() {
    return await prisma.settings.findFirst({
      where: { id: 1 }
    });
  }

  // อัปเดตหรือสร้างการตั้งค่า
  async update_settings(data: any) {
    return await prisma.settings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data }
    });
  }
}