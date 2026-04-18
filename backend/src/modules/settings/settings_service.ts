import { supabase } from '../../config/supabase';

export class SettingsService {
  // ดึงค่าการตั้งค่าทั้งหมด (ใช้ ID: 1 เสมอ)
  async get_settings() {
    const { data, error } = await supabase
      .from('Settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle(); //

    if (error) {
      console.error("Error fetching settings:", error.message);
      throw new Error(error.message);
    }
    return data;
  }

  // อัปเดตหรือสร้างการตั้งค่า (Upsert)
  async update_settings(data: any) {
    // เตรียมข้อมูลที่จะบันทึก โดยเน้นฟิลด์หลักที่ต้องใช้ร่วมกัน
    const updateData = {
      id: 1,
      businessName: data.businessName,
      email: data.email,
      phone: data.phone,
    };

    const { data: updatedSettings, error } = await supabase
      .from('Settings')
      .upsert(updateData) //
      .select()
      .single();

    if (error) {
      console.error("Error updating settings:", error.message);
      throw new Error(error.message);
    }
    
    return updatedSettings;
  }
}