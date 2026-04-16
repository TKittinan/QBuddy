import { prisma } from '../../lib/prisma';
// 🌟 Import Prisma เข้ามาช่วยทำ Type ให้ Transaction
import { TicketStatus, Prisma } from '@prisma/client';

export class TicketService {
  async get_tickets_by_place(place_id: string) {
    return await prisma.ticket.findMany({
      where: { placeId: place_id },
      orderBy: { createdAt: 'asc' } 
    });
  }

  private async generate_id(place_id: string, service_category: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const countToday = await prisma.ticket.count({
      where: {
        placeId: place_id,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
    });

    const prefix = service_category === 'ร้านอาหาร' ? 'R' : service_category === 'คาเฟ่' ? 'C' : 'B';
    const runningNumber = (countToday + 1).toString().padStart(3, '0');
    return `${prefix}-${runningNumber}`;
  }

  async get_queue_status(ticket_id: string) {
    const currentTicket = await prisma.ticket.findUnique({
      where: { id: ticket_id },
      include: { place: true }
    });

    if (!currentTicket) throw new Error('Ticket not found');

    const queuesAhead = await prisma.ticket.count({
      where: {
        placeId: currentTicket.placeId,
        status: 'Waiting',
        createdAt: { lt: currentTicket.createdAt } 
      }
    });

    const avgServiceTime = currentTicket.place?.avgServiceTime || 15;
    
    return {
      ticketId: ticket_id,
      status: currentTicket.status,
      queuesAhead,
      estimatedWaitTime: queuesAhead * avgServiceTime
    };
  }

  async create_ticket(data: any) {
    const customId = await this.generate_id(data.place_id, data.service);

    // 🌟 ใส่ Type ให้ tx
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const ticket = await tx.ticket.create({
        data: {
          id: customId,
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

      await tx.place.update({
        where: { id: data.place_id },
        data: { queueCount: { increment: 1 } }
      });

      return ticket;
    });
  }

  async update_ticket_status(id: string, status: TicketStatus) {
    // 🌟 ใส่ Type ให้ tx
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const ticket = await tx.ticket.update({
        where: { id },
        data: { status }
      });

      if (status === 'Completed' || status === 'Cancelled' || status === 'Skipped') {
        await tx.place.update({
          where: { id: ticket.placeId },
          data: { queueCount: { decrement: 1 } }
        });
      }

      return ticket;
    });
  }
}