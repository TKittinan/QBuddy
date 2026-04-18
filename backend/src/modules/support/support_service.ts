import { supabase } from '../../config/supabase';

export class SupportService {
  // สร้างตั๋วแจ้งปัญหาใหม่
  async create_support_ticket(data: { user_id: string; subject: string; category: any }) {
    const { data: ticket, error } = await supabase
      .from('supportTickets') // ตรวจสอบชื่อ Table ใน Supabase
      .insert([{
        userId: data.user_id,
        subject: data.subject,
        category: data.category,
        status: 'Pending'
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return ticket;
  }

  // ส่งข้อความคุยในตั๋วแจ้งปัญหา
  async send_message(data: { ticket_id: string; sender_id: string; text: string }) {
    const { data: message, error } = await supabase
      .from('messages')
      .insert([{
        ticketId: data.ticket_id,
        senderId: data.sender_id,
        text: data.text
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return message;
  }

  // ดึงประวัติการคุยทั้งหมดของตั๋วนั้นๆ
  async get_ticket_messages(ticket_id: string) {
    // ใช้ select แบบดึงข้อมูล Message และชื่อผู้ส่งมาพร้อมกัน
    const { data: ticket, error } = await supabase
      .from('supportTickets')
      .select(`
        *,
        messages (
          *,
          sender:users (name)
        )
      `)
      .eq('id', ticket_id)
      .order('timestamp', { foreignTable: 'messages', ascending: true })
      .single();

    if (error) throw new Error(error.message);
    return ticket;
  }

  // เพิ่มฟังก์ชันลบตั๋วแจ้งปัญหา
  async delete_ticket(id: string) {
    // หมายเหตุ: ปกติใน Supabase ควรตั้ง ON DELETE CASCADE ไว้ที่ตาราง messages
    // เพื่อให้เวลาลบ Ticket แล้วข้อความที่คุยกันถูกลบออกไปด้วยอัตโนมัติ
    const { error } = await supabase
      .from('supportTickets')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }
}