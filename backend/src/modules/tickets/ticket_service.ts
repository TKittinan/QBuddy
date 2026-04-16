import { prisma } from '../../lib/prisma';
import { TicketStatus } from '@prisma/client';

export class TicketService {
  // ดึงคิวทั้งหมดของร้านค้าหนึ่งๆ
  async get_tickets_by_place(place_id: string) {
    return await prisma.ticket.findMany({
      where: { placeId: place_id },
      orderBy: { createdAt: 'asc' } // เรียงตามเวลาที่จอง
    });
  }

  // สร้างคิวใหม่ (Booking/Queueing)
  async create_ticket(data: any) {
    // ใช้ Transaction เพื่อให้แน่ใจว่าถ้าสร้าง Ticket สำเร็จ ต้องอัปเดตจำนวนคิวในร้านด้วย
    return await prisma.$transaction(async (tx) => {
      // 1. สร้าง Ticket
      const ticket = await tx.ticket.create({
        data: {
          name: data.name,
          service: data.service,
          guests: data.guests,
          bookDate: data.book_date,
          bookTime: data.book_time,
          tableType: data.table_type,
          status: 'Waiting',
          placeId: data.place_id,
        }
      });

      // 2. อัปเดตจำนวนคิวปัจจุบันใน Table ของ Place
      await tx.place.update({
        where: { id: data.place_id },
        data: {
          queueCount: { increment: 1 }
        }
      });

      return ticket;
    });
  }

  // อัปเดตสถานะคิว (เช่น เปลี่ยนจาก Waiting เป็น Serving หรือ Cancelled)
  async update_ticket_status(id: string, status: TicketStatus) {
    return await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.update({
        where: { id },
        data: { status }
      });

      // ถ้าคิวเสร็จสิ้น หรือถูกยกเลิก ให้ลดจำนวนคิวในร้านลง
      if (status === 'Completed' || status === 'Cancelled' || status === 'Skipped') {
        await tx.place.update({
          where: { id: ticket.placeId },
          data: {
            queueCount: { decrement: 1 }
          }
        });
      }

      return ticket;
    });
  }
}