import { prisma } from '../../lib/prisma';

export class PlaceService {
  // ดึงรายการร้านค้าทั้งหมด
  async get_all_places() {
    return await prisma.place.findMany({
      include: { tableTypes: true } // ให้ดึงข้อมูลประเภทโต๊ะออกมาด้วย
    });
  }

  // ดูรายละเอียดร้านค้าเดียว
  async get_place_by_id(id: string) {
    return await prisma.place.findUnique({
      where: { id },
      include: { tableTypes: true }
    });
  }

  // สร้างร้านค้าใหม่
  async create_place(data: any) {
    const { table_types, ...place_data } = data;
    
    return await prisma.place.create({
      data: {
        ...place_data,
        // ถ้ามีข้อมูลโต๊ะส่งมาพร้อมกัน ให้สร้างไปพร้อมกันเลย
        tableTypes: {
          create: table_types || []
        }
      }
    });
  }
}