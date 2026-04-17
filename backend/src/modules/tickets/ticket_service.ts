import { supabase } from '../../config/supabase';

export class TicketService {
  // 1. ดึงข้อมูลตั๋วตามสถานที่ (ใช้ place_id ตามโครงสร้างจริง)
  async get_tickets_by_place(place_id: string) {
    const { data, error } = await supabase
      .from('tickets') // ตารางตัวเล็กตาม DB
      .select('*')
      .eq('place_id', place_id) // อ้างอิง place_id
      .order('createdAt', { ascending: true });

    if (error) {
      console.error("Error fetching tickets:", error.message);
      throw new Error(error.message);
    }
    return data;
  }

  // 2. ฟังก์ชันช่วยสร้าง ID (แก้ไขเพื่อป้องกัน ID ซ้ำ)
  private async generate_id(place_id: string, service_category: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // นับจำนวนตั๋วทั้งหมดของร้านนี้ในวันนี้เพื่อออกเลข Running Number
    const { count, error } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('place_id', place_id) //
      .gte('createdAt', today.toISOString());

    if (error) throw new Error(error.message);

    const prefix = service_category === 'ร้านอาหาร' ? 'R' : service_category === 'คาเฟ่' ? 'C' : 'B';
    // ใช้ count + 1 เสมอเพื่อให้ได้เลขถัดไป
    const runningNumber = ((count || 0) + 1).toString().padStart(3, '0');
    return `${prefix}-${runningNumber}`;
  }

  // ฟังก์ชันตรวจสอบสถานะคิว
  async get_queue_status(ticket_id: string) {
    const { data: currentTicket, error } = await supabase
      .from('tickets')
      .select('*, place:places(*)')
      .eq('id', ticket_id)
      .single();

    if (error || !currentTicket) throw new Error('Ticket not found');

    const { count: queuesAhead, error: countError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('place_id', currentTicket.place_id) //
      .eq('status', 'Waiting')
      .lt('createdAt', currentTicket.createdAt);

    if (countError) throw new Error(countError.message);

    const avgServiceTime = (currentTicket.place as any)?.avgServiceTime || 15;
    
    return {
      ticketId: ticket_id,
      status: currentTicket.status,
      queuesAhead: queuesAhead || 0,
      estimatedWaitTime: (queuesAhead || 0) * avgServiceTime
    };
  }

  // 3. สร้างตั๋วใหม่ (Fix Error 400/500 และ Duplicate Key)
  async create_ticket(data: any): Promise<any> {
    const targetPlaceId = data.placeId || data.place_id || data.shopId;
    const targetService = data.service || 'ร้านอาหาร';

    if (!targetPlaceId) throw new Error("Missing placeId/shopId");

    // เจนเนอเรต ID ใหม่
    const customId = await this.generate_id(targetPlaceId, targetService);

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert([{
        id: customId,
        name: data.name,
        service: targetService,
        guests: data.guests,
        bookDate: data.bookDate || data.book_date,
        bookTime: data.bookTime || data.book_time,
        tableType: data.tableType || data.table_type || 'General',
        status: 'Waiting',
        place_id: targetPlaceId, // ต้องใช้ place_id ตาม DB
      }])
      .select()
      .single();

    // จัดการกรณี ID ซ้ำแบบ Force Retry (ถ้าเจอ Duplicate Key ให้รันใหม่)
    if (ticketError) {
      if (ticketError.code === '23505') { 
        return this.create_ticket(data); 
      }
      throw new Error(ticketError.message);
    }

    // อัปเดตคิวรวมในตารางร้านค้า
    const { data: place } = await supabase.from('places').select('queueCount').eq('id', targetPlaceId).single();
    await supabase.from('places').update({ queueCount: (place?.queueCount || 0) + 1 }).eq('id', targetPlaceId);

    return ticket;
  }

  // 4. อัปเดตสถานะ (เปลี่ยน placeId -> place_id)
  async update_ticket_status(id: string, status: string) {
    const { data: ticket, error: updateError } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    if (['Completed', 'Cancelled', 'Skipped'].includes(status)) {
      const { data: place } = await supabase.from('places').select('queueCount').eq('id', ticket.place_id).single();
      const newCount = Math.max(0, (place?.queueCount || 0) - 1);
      await supabase.from('places').update({ queueCount: newCount }).eq('id', ticket.place_id);
    }

    return ticket;
  }

  // 5. ลบตั๋ว (เปลี่ยน placeId -> place_id)
  async delete_ticket(id: string) {
    const { data: ticket } = await supabase.from('tickets').select('place_id, status').eq('id', id).single();
    
    if (ticket && ticket.status === 'Waiting') {
      const { data: place } = await supabase.from('places').select('queueCount').eq('id', ticket.place_id).single();
      const newCount = Math.max(0, (place?.queueCount || 0) - 1);
      await supabase.from('places').update({ queueCount: newCount }).eq('id', ticket.place_id);
    }

    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }
}