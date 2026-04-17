import { supabase } from '../../config/supabase';

export class UserService {
  // ดึงข้อมูล User ทั้งหมด
  async get_all_users() {
    const { data, error } = await supabase
      .from('users') // ชื่อ Table ใน Supabase
      .select('id, name, email, role, status');

    if (error) throw new Error(error.message);
    return data;
  }

  // ค้นหา User ด้วย ID
  async get_user_by_id(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // สร้าง User ใหม่
  async create_user(data: { name: string; email: string; password?: string; role?: any }) {
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        ...data,
        status: 'ACTIVE'
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return newUser;
  }

  // --- เพิ่มฟังก์ชันอัปเดต (เพื่อรองรับการแก้ไขข้อมูล User) ---
  async update_user(id: string, data: any) {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updatedUser;
  }

  // --- เพิ่มฟังก์ชันลบ User (ตามที่ขอมาครับ) ---
  async delete_user(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }
}