import { prisma } from '../../lib/prisma';
import { SupportCategory } from '@prisma/client';

export class SupportService {
  // สร้างตั๋วแจ้งปัญหาใหม่
  async create_support_ticket(data: { user_id: string; subject: string; category: SupportCategory }) {
    return await prisma.supportTicket.create({
      data: {
        userId: data.user_id,
        subject: data.subject,
        category: data.category,
        status: 'Pending'
      }
    });
  }

  // ส่งข้อความคุยในตั๋วแจ้งปัญหา
  async send_message(data: { ticket_id: string; sender_id: string; text: string }) {
    return await prisma.message.create({
      data: {
        ticketId: data.ticket_id,
        senderId: data.sender_id,
        text: data.text
      }
    });
  }

  // ดึงประวัติการคุยทั้งหมดของตั๋วนั้นๆ
  async get_ticket_messages(ticket_id: string) {
    return await prisma.supportTicket.findUnique({
      where: { id: ticket_id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
          include: { sender: { select: { name: true } } }
        }
      }
    });
  }
}