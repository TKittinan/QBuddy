import { supabase } from '../../config/supabase';

export class TicketService {
  
  async get_tickets_by_place(place_id: string) {
    const { data, error } = await supabase.from('tickets').select('*').eq('place_id', place_id).order('createdAt', { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  }

  // ฟังก์ชันแปลงชื่อประเภทโต๊ะให้เป็นโค้ด (A, B, C, D, E)
  private get_table_code(tableType: string): string {
    const typeStr = (tableType || '').toLowerCase();
    if (typeStr.includes('1-2')) return 'A';
    if (typeStr.includes('3-4')) return 'B';
    if (typeStr.includes('5-6')) return 'C';
    if (typeStr.includes('7-8')) return 'D';
    if (typeStr.includes('10+')) return 'E';
    return 'X'; // Default กรณีไม่ตรงเงื่อนไข
  }

  // 2. ฟังก์ชันช่วยสร้าง Ticket ID (รองรับตัดคิว 6 โมงเช้า)
  private async generate_id(place_id: string, tableType: string) {
    const now = new Date();
    const cycleStart = new Date(now);
    if (now.getHours() < 6) {
      cycleStart.setDate(cycleStart.getDate() - 1);
    }
    cycleStart.setHours(6, 0, 0, 0); 
    const cycleEnd = new Date(cycleStart);
    cycleEnd.setDate(cycleEnd.getDate() + 1);

    const { count, error } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('place_id', place_id) 
      .eq('tableType', tableType)
      .gte('createdAt', cycleStart.toISOString())
      .lt('createdAt', cycleEnd.toISOString());

    if (error) throw new Error(error.message);

    let shopPart = place_id;
    if (place_id.includes('-')) {
      const parts = place_id.split('-');
      const prefix = parts[0];
      const branchNum = parseInt(parts[1], 10).toString(); 
      shopPart = `${prefix}${branchNum}`;
    }

    const tableCode = this.get_table_code(tableType);
    const runningNumber = ((count || 0) + 1).toString().padStart(3, '0');
    return `${shopPart}${tableCode}-CM${runningNumber}`;
  }

  async get_queue_status(ticket_id: string) {
    const { data: currentTicket, error } = await supabase.from('tickets').select('*, place:Place(*)').eq('id', ticket_id).single();
    if (error || !currentTicket) throw new Error('Ticket not found');
    const { count: queuesAhead, error: countError } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('place_id', currentTicket.place_id).eq('status', 'Waiting').lt('createdAt', currentTicket.createdAt);
    if (countError) throw new Error(countError.message);
    const avgServiceTime = (currentTicket.place as any)?.avgServiceTime || 15;
    return { ticketId: ticket_id, status: currentTicket.status, queuesAhead: queuesAhead || 0, estimatedWaitTime: (queuesAhead || 0) * avgServiceTime };
  }

  // 3. สร้างตั๋วใหม่ (พร้อมระบบเช็ค Capacity)
  async create_ticket(data: any): Promise<any> {
    const targetPlaceId = data.placeId || data.place_id || data.shopId;
    const targetService = data.service || 'ร้านอาหาร';
    const targetTableType = data.tableType || data.table_type || '1-2 People';
    const bookDate = data.bookDate || data.book_date;

    if (!targetPlaceId) throw new Error("Missing placeId/shopId");

    const { data: tableInfo } = await supabase
      .from('TableType')
      .select('capacity')
      .eq('placeId', targetPlaceId)
      .eq('label', targetTableType) 
      .single();

    if (tableInfo && bookDate) {
      const { count } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('place_id', targetPlaceId)
        .eq('tableType', targetTableType)
        .eq('bookDate', bookDate)
        .in('status', ['Waiting', 'Serving']); // 🌟 แก้ไข: เอา Completed ออก โต๊ะจะได้ว่างให้จองใหม่

      if (count !== null && count >= tableInfo.capacity) {
        throw new Error(`โต๊ะประเภท ${targetTableType} ถูกจองเต็มแล้วสำหรับวันที่ ${bookDate} กรุณาเลือกโต๊ะอื่นหรือวันอื่น`);
      }
    }

    const customId = await this.generate_id(targetPlaceId, targetTableType);

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert([{
        id: customId, 
        name: data.name,
        email: data.email, 
        service: targetService,
        guests: data.guests,
        bookDate: bookDate,
        bookTime: data.bookTime || data.book_time,
        tableType: targetTableType,
        status: 'Waiting',
        place_id: targetPlaceId,
      }])
      .select()
      .single();

    if (ticketError) {
      if (ticketError.code === '23505') { return this.create_ticket(data); }
      throw new Error(ticketError.message);
    }

    const { data: place } = await supabase.from('Place').select('queueCount').eq('id', targetPlaceId).single();
    await supabase.from('Place').update({ queueCount: (place?.queueCount || 0) + 1 }).eq('id', targetPlaceId);

    return ticket;
  }

  // 🌟 เพิ่มฟังก์ชันใหม่ อัปเดตข้อมูลตั๋ว (Edit)
  async update_ticket(id: string, data: any) {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .update({
        name: data.name,
        email: data.email,
        guests: data.guests,
        bookDate: data.bookDate || data.book_date,
        bookTime: data.bookTime || data.book_time,
        tableType: data.tableType || data.table_type,
        place_id: data.shopId || data.placeId || data.place_id,
        status: data.status
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return ticket;
  }

  async update_ticket_status(id: string, status: string) {
    const { data: ticket, error: updateError } = await supabase.from('tickets').update({ status }).eq('id', id).select().single();
    if (updateError) throw new Error(updateError.message);

    if (['Completed', 'Cancelled', 'Skipped'].includes(status)) {
      const { data: place } = await supabase.from('Place').select('queueCount').eq('id', ticket.place_id).single();
      const newCount = Math.max(0, (place?.queueCount || 0) - 1);
      await supabase.from('Place').update({ queueCount: newCount }).eq('id', ticket.place_id);
    }
    return ticket;
  }

  async delete_ticket(id: string) {
    const { data: ticket } = await supabase.from('tickets').select('place_id, status').eq('id', id).single();
    if (ticket && ticket.status === 'Waiting') {
      const { data: place } = await supabase.from('Place').select('queueCount').eq('id', ticket.place_id).single();
      const newCount = Math.max(0, (place?.queueCount || 0) - 1);
      await supabase.from('Place').update({ queueCount: newCount }).eq('id', ticket.place_id);
    }
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }
}