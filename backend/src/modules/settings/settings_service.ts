import { supabase } from '../../config/supabase';

export class SettingsService {
  // ดึงค่าการตั้งค่าทั้งหมด (ใช้ ID: 1 เสมอ)
  async get_settings() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle(); // ใช้ maybeSingle เพราะถ้าไม่เจอจะได้ไม่ Error (ส่ง null กลับไป)

    if (error) throw new Error(error.message);
    return data;
  }

  // อัปเดตหรือสร้างการตั้งค่า (Upsert)
  async update_settings(data: any) {
    const { data: updatedSettings, error } = await supabase
      .from('settings')
      .upsert({ id: 1, ...data }) // ระบุ id: 1 เพื่อให้ Supabase รู้ว่าต้องทับแถวเดิม
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updatedSettings;
  }
}