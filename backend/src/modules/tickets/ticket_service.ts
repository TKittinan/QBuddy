import { supabase } from '../../config/supabase';

export class TicketService {
  async get_tickets_by_place(place_id: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('placeId', place_id)
      .order('createdAt', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  }

  private async generate_id(place_id: string, service_category: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // นับจำนวนตั๋วของวันนี้
    const { count, error } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('placeId', place_id)
      .gte('createdAt', todayStart.toISOString())
      .lte('createdAt', todayEnd.toISOString());

    if (error) throw new Error(error.message);

    const prefix = service_category === 'ร้านอาหาร' ? 'R' : service_category === 'คาเฟ่' ? 'C' : 'B';
    const runningNumber = ((count || 0) + 1).toString().padStart(3, '0');
    return `${prefix}-${runningNumber}`;
  }

  async get_queue_status(ticket_id: string) {
    // ดึงข้อมูลตั๋วพร้อมข้อมูลร้านค้า
    const { data: currentTicket, error } = await supabase
      .from('tickets')
      .select('*, place:places(*)')
      .eq('id', ticket_id)
      .single();

    if (error || !currentTicket) throw new Error('Ticket not found');

    // นับคิวที่อยู่ข้างหน้า
    const { count: queuesAhead, error: countError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('placeId', currentTicket.placeId)
      .eq('status', 'Waiting')
      .lt('createdAt', currentTicket.createdAt);

    if (countError) throw new Error(countError.message);

    const avgServiceTime = currentTicket.place?.avgServiceTime || 15;
    
    return {
      ticketId: ticket_id,
      status: currentTicket.status,
      queuesAhead: queuesAhead || 0,
      estimatedWaitTime: (queuesAhead || 0) * avgServiceTime
    };
  }

  async create_ticket(data: any) {
    const customId = await this.generate_id(data.place_id, data.service);

    // 1. สร้างตั๋วใหม่
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert([{
        id: customId,
        name: data.name,
        service: data.service,
        guests: data.guests,
        bookDate: data.book_date,
        bookTime: data.book_time,
        tableType: data.table_type,
        status: 'Waiting',
        placeId: data.place_id,
      }])
      .select()
      .single();

    if (ticketError) throw new Error(ticketError.message);

    // 2. อัปเดตจำนวนคิวในร้านค้า
    // หมายเหตุ: Supabase ใช้ .rpc() สำหรับการ increment ค่าที่แม่นยำได้ หรือดึงค่ามาบวกแล้วส่งกลับ
    const { data: place } = await supabase.from('places').select('queueCount').eq('id', data.place_id).single();
    await supabase.from('places').update({ queueCount: (place?.queueCount || 0) + 1 }).eq('id', data.place_id);

    return ticket;
  }

  async update_ticket_status(id: string, status: string) {
    // 1. อัปเดตสถานะตั๋ว
    const { data: ticket, error: updateError } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    // 2. ลดจำนวนคิวถ้าระบบเสร็จสิ้นหรือยกเลิก
    if (status === 'Completed' || status === 'Cancelled' || status === 'Skipped') {
      const { data: place } = await supabase.from('places').select('queueCount').eq('id', ticket.placeId).single();
      const newCount = Math.max(0, (place?.queueCount || 0) - 1);
      await supabase.from('places').update({ queueCount: newCount }).eq('id', ticket.placeId);
    }

    return ticket;
  }

  // เพิ่มฟังก์ชันลบ Ticket ตามที่ขอ
  async delete_ticket(id: string) {
    // ดึงข้อมูลก่อนเพื่อตรวจสอบเรื่อง queueCount
    const { data: ticket } = await supabase.from('tickets').select('placeId, status').eq('id', id).single();
    
    if (ticket && ticket.status === 'Waiting') {
      const { data: place } = await supabase.from('places').select('queueCount').eq('id', ticket.placeId).single();
      const newCount = Math.max(0, (place?.queueCount || 0) - 1);
      await supabase.from('places').update({ queueCount: newCount }).eq('id', ticket.placeId);
    }

    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }
}