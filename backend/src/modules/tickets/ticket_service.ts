import { supabase } from '../../config/supabase';

export class TicketService {
  private async log_activity(userName: string, action: string, type: string, status: string) {
    try {
      await supabase.from('ActivityLog').insert([{ userName, action, type, status }]);
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  }

  async get_tickets_by_place(placeId: string) {
    const { data, error } = await supabase
      .from('Ticket')
      .select('*')
      .eq('placeId', placeId)
      .order('createdAt', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data;
  }

  async get_booked_slots(shopId: string, date: string) {
    const { data, error } = await supabase
      .from('Ticket')
      .select('bookTime, tableType, tableCount, status')
      .eq('placeId', shopId)
      .eq('bookDate', date)
      .in('status', ['Waiting', 'Serving']);
      
    if (error) throw new Error(error.message);
    return data || [];
  }

  async get_active_bookings(shopId: string) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('Ticket')
      .select('bookDate, bookTime, tableType, tableCount, status')
      .eq('placeId', shopId)
      .gte('bookDate', today)
      .in('status', ['Waiting', 'Serving']);
      
    if (error) throw new Error(error.message);
    return data || [];
  }

  private get_table_code(tableType: string): string {
    const typeStr = String(tableType || '').toLowerCase().replace(/\s/g, '');
    if (typeStr.includes('1-2')) return 'A';
    if (typeStr.includes('3-4')) return 'B';
    if (typeStr.includes('5-6')) return 'C';
    if (typeStr.includes('7-8')) return 'D';
    if (typeStr.includes('10')) return 'E'; 
    return 'X';
  }

  private async generate_id(placeId: string, tableType: string) {
    const now = new Date();
    const cycleStart = new Date(now);
    if (now.getHours() < 6) cycleStart.setDate(cycleStart.getDate() - 1);
    cycleStart.setHours(6, 0, 0, 0); 
    const cycleEnd = new Date(cycleStart);
    cycleEnd.setDate(cycleEnd.getDate() + 1);

    const { count, error } = await supabase
      .from('Ticket')
      .select('*', { count: 'exact', head: true })
      .eq('placeId', placeId) 
      .eq('tableType', tableType)
      .gte('createdAt', cycleStart.toISOString())
      .lt('createdAt', cycleEnd.toISOString());

    if (error) throw new Error(error.message);

    const tableCode = this.get_table_code(tableType);
    const runningNumber = ((count || 0) + 1).toString().padStart(3, '0');
    return `${placeId.replace(/-/g, '')}${tableCode}-CM${runningNumber}`;
  }

  async get_queue_status(ticketId: string) {
    const { data: currentTicket, error } = await supabase
      .from('Ticket')
      .select('*, place:Place(*)')
      .eq('id', ticketId)
      .single();
      
    if (error || !currentTicket) throw new Error('Ticket not found');
    
    const { count: queuesAhead } = await supabase
      .from('Ticket')
      .select('*', { count: 'exact', head: true })
      .eq('placeId', currentTicket.placeId)
      .eq('status', 'Waiting')
      .lt('createdAt', currentTicket.createdAt);
      
    const avgServiceTime = (currentTicket.place as any)?.avgServiceTime || 15;
    return { 
      ticketId, 
      status: currentTicket.status, 
      queuesAhead: queuesAhead || 0, 
      estimatedWaitTime: (queuesAhead || 0) * avgServiceTime 
    };
  }

  async create_ticket(data: any): Promise<any> {
    const targetPlaceId = data.placeId || data.shopId;
    const targetTableType = data.tableType || '1-2 คน';
    const bookDate = data.bookDate;
    const tableCount = data.tableCount || 1;

    const { data: tableInfo } = await supabase
      .from('TableType')
      .select('capacity')
      .eq('placeId', targetPlaceId)
      .eq('label', targetTableType) 
      .single();

    if (tableInfo && bookDate) {
      const { data: activeTickets } = await supabase
        .from('Ticket')
        .select('tableCount')
        .eq('placeId', targetPlaceId)
        .eq('tableType', targetTableType)
        .eq('bookDate', bookDate)
        .eq('bookTime', data.bookTime)
        .in('status', ['Waiting', 'Serving']); 

      const bookedSum = activeTickets?.reduce((sum, t) => sum + (t.tableCount || 1), 0) || 0;
      const totalStock = tableInfo.capacity || 1; 

      if (bookedSum + tableCount > totalStock) {
        throw new Error(`โต๊ะประเภท ${targetTableType} เต็มแล้วสำหรับเวลา ${data.bookTime} น.`);
      }
    }

    const customId = await this.generate_id(targetPlaceId, targetTableType);

    const { data: ticket, error: ticketError } = await supabase
      .from('Ticket')
      .insert([{
        id: customId, 
        name: data.name,
        email: data.email, 
        service: data.service || 'ร้านอาหาร',
        guests: data.guests,
        bookDate: bookDate,
        bookTime: data.bookTime,
        tableType: targetTableType,
        tableCount: tableCount, 
        status: 'Waiting',
        placeId: targetPlaceId,
      }])
      .select().single();

    if (ticketError) throw new Error(ticketError.message);

    const { data: place } = await supabase.from('Place').select('queueCount').eq('id', targetPlaceId).single();
    await supabase.from('Place').update({ queueCount: (place?.queueCount || 0) + 1 }).eq('id', targetPlaceId);

    await this.log_activity(data.name, `จองคิวใหม่: ${customId}`, 'Booking', 'Waiting');
    return ticket;
  }

  async update_ticket(id: string, data: any) {
    const { data: ticket, error: updateError } = await supabase
      .from('Ticket')
      .update({ 
        name: data.name,
        email: data.email,
        guests: data.guests, 
        bookDate: data.bookDate,
        bookTime: data.bookTime,
        tableType: data.tableType,
        tableCount: data.tableCount,
        service: data.service,
        status: data.status,
        placeId: data.placeId
      })
      .eq('id', id)
      .select().single();
      
    if (updateError) throw new Error(updateError.message);

    await this.log_activity(ticket.name, `แก้ไขข้อมูลการจอง: ${id}`, 'Booking', ticket.status);
    return ticket;
  }

  async update_ticket_status(id: string, status: string) {
    const { data: ticket, error: updateError } = await supabase
      .from('Ticket')
      .update({ status })
      .eq('id', id)
      .select().single();
      
    if (updateError) throw new Error(updateError.message);

    if (['Completed', 'Cancelled', 'Skipped'].includes(status)) {
      const { data: place } = await supabase.from('Place').select('queueCount').eq('id', ticket.placeId).single();
      const newCount = Math.max(0, (place?.queueCount || 0) - 1);
      await supabase.from('Place').update({ queueCount: newCount }).eq('id', ticket.placeId);
    }

    await this.log_activity(ticket.name, `เปลี่ยนสถานะคิวเป็น: ${status}`, 'Booking', status);
    return ticket;
  }

  async delete_ticket(id: string) {
    const { data: ticket } = await supabase.from('Ticket').select('name, placeId, status').eq('id', id).single();
    if (ticket && ticket.status === 'Waiting') {
      const { data: place } = await supabase.from('Place').select('queueCount').eq('id', ticket.placeId).single();
      const newCount = Math.max(0, (place?.queueCount || 0) - 1);
      await supabase.from('Place').update({ queueCount: newCount }).eq('id', ticket.placeId);
    }
    const { error } = await supabase.from('Ticket').delete().eq('id', id);
    if (error) throw new Error(error.message);
    if (ticket) await this.log_activity(ticket.name, `ลบคิวออกจากระบบ`, 'Booking', 'Cancelled');
    return true;
  }
}