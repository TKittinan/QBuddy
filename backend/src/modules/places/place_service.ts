import { supabase } from '../../config/supabase';

export class PlaceService {
  // ... (ฟังก์ชัน get_all_places, get_place_by_id คงเดิม) ...
  async get_all_places() {
    const { data, error } = await supabase.from('Place').select('*, TableType(*)'); 
    if (error) throw new Error(error.message);
    return data;
  }

  async get_place_by_id(id: string) {
    const { data, error } = await supabase.from('Place').select('*, TableType(*)').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data;
  }

  // 🌟 ฟังก์ชันช่วยสร้างตัวย่อร้าน (เช่น Suki Teenoi Jao Run Tume -> ST)
  private get_shop_prefix(name: string): string {
    const cleanName = name.trim().replace(/[^a-zA-Z0-9\s]/g, ''); // ลบอักขระพิเศษ
    const words = cleanName.split(/\s+/).filter(w => w.length > 0);
    
    if (words.length === 0) return 'XX';
    if (words.length === 1) {
      // ถ้าร้านมีคำเดียว เอา 2 ตัวอักษรแรก (เช่น Katsuya -> KA)
      return words[0].substring(0, 2).toUpperCase();
    }
    // ถ้ามีหลายคำ เอาตัวแรกของคำแรก + ตัวแรกของคำสุดท้าย
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  // 🌟 ฟังก์ชันช่วยสร้างตัวย่อสาขา (เช่น Siam Square -> S)
  private get_branch_prefix(branch?: string): string {
    if (!branch || branch.trim() === '') return '';
    const cleanBranch = branch.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    const words = cleanBranch.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return '';
    return words[0][0].toUpperCase(); // เอาแค่ตัวแรกของคำแรก
  }

  // 🌟 3. สร้าง Place ใหม่ (พร้อม Logic เจน ID ร้าน)
  async create_place(data: any) {
    const { id, table_types, TableType, tags, ...place_data } = data;

    // 1. ดึงหมวดหมู่ตัวแรกสุดมาใช้เช็ค
    const firstCategory = (place_data.category || '').split(',')[0].trim().toLowerCase();
    const shopNameLower = (place_data.name || '').trim().toLowerCase();

    // 2. ค้นหาร้านในระบบที่ชื่อเหมือนกันและหมวดหมู่แรกเหมือนกัน เพื่อหาลำดับสาขา
    const { data: existingShops, error: checkError } = await supabase
      .from('Place')
      .select('id, name, category');
    
    if (checkError) throw new Error(checkError.message);

    // กรองหาว่าร้านนี้มีกี่สาขาแล้ว
    const sameShops = (existingShops || []).filter(shop => {
      const sName = (shop.name || '').trim().toLowerCase();
      const sCat = (shop.category || '').split(',')[0].trim().toLowerCase();
      return sName === shopNameLower && sCat === firstCategory;
    });

    const branchNumber = sameShops.length + 1; // ลำดับสาขาถัดไป
    const branchNumberStr = branchNumber.toString().padStart(3, '0'); // ทำให้เป็น 3 หลัก เช่น 001

    // 3. ประกอบร่าง Place ID
    const shopPrefix = this.get_shop_prefix(place_data.name);
    const branchPrefix = this.get_branch_prefix(place_data.branch);
    
    // รูปแบบ: ตัวย่อร้าน + ตัวย่อสาขา + '-' + เลขรันนิ่ง
    const generatedPlaceId = `${shopPrefix}${branchPrefix}-${branchNumberStr}`;

    // ยัด ID ที่เจนได้ใส่กลับเข้าไปในข้อมูลที่จะเซฟ
    place_data.id = generatedPlaceId;

    const { data: newPlace, error: placeError } = await supabase
      .from('Place')
      .insert([place_data]) 
      .select()
      .single();

    if (placeError) {
      if (placeError.code === '23505') {
        throw new Error(`รหัสร้าน ${generatedPlaceId} ซ้ำในระบบ กรุณาลองใหม่อีกครั้ง`);
      }
      throw new Error(placeError.message);
    }

    if (table_types && table_types.length > 0) {
      const tableTypesToInsert = table_types.map((tt: any) => ({
        name: tt.name,
        label: tt.label, 
        capacity: tt.capacity,
        placeId: newPlace.id 
      }));

      const { error: ttError } = await supabase.from('TableType').insert(tableTypesToInsert);
      if (ttError) throw new Error(ttError.message);
    }

    return await this.get_place_by_id(newPlace.id);
  }

  // ... (ฟังก์ชัน update_place, delete_place, get_ai_recommendations คงเดิม) ...
  async update_place(id: string, data: any) {
    const { table_types, TableType, tags, ...place_data } = data;
    const { data: updatedPlace, error: placeError } = await supabase.from('Place').update(place_data).eq('id', id).select().single();
    if (placeError) throw new Error(placeError.message);

    if (table_types) {
      await supabase.from('TableType').delete().eq('placeId', id);
      if (table_types.length > 0) {
        const tableTypesToInsert = table_types.map((tt: any) => ({
          name: tt.name, label: tt.label, capacity: tt.capacity, placeId: id
        }));
        const { error: ttError } = await supabase.from('TableType').insert(tableTypesToInsert);
        if (ttError) throw new Error(ttError.message);
      }
    }
    return await this.get_place_by_id(id);
  }

  // 5. ลบ Place
  async delete_place(id: string) {
    //สั่งลบข้อมูลโต๊ะที่ผูกกับร้านนี้ทิ้งก่อน
    const { error: ttError } = await supabase
      .from('TableType')
      .delete()
      .eq('placeId', id);

    if (ttError) throw new Error("ลบข้อมูลโต๊ะไม่สำเร็จ: " + ttError.message);

    //เมื่อลบหมดแล้วถึงจะลบร้านค้าได้
    const { error } = await supabase
      .from('Place')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }

  async get_ai_recommendations(user_name: string) {
    const { data: history, error: historyError } = await supabase.from('Ticket').select('*, place:Place(*)').eq('name', user_name).eq('status', 'Completed');
    if (historyError) throw new Error(historyError.message);
    if (!history || history.length === 0) {
      const { data: recommended } = await supabase.from('Place').select('*').eq('status', 'Active').limit(5); 
      return recommended;
    }
    const categories = history.flatMap((h: any) => h.place?.category?.split(',') || []);
    const uniqueFavoriteCats = [...new Set(categories)];
    const visited_place_ids = history.map((h: any) => h.placeId);
    let { data: recommended, error: recError } = await supabase.from('Place').select('*').eq('status', 'Active').not('id', 'in', `(${visited_place_ids.join(',')})`).ilike('category', `%${uniqueFavoriteCats[0]}%`).limit(5);
    if (recError || !recommended || recommended.length === 0) {
      const { data: fallback } = await supabase.from('Place').select('*').eq('status', 'Active').limit(5);
      return fallback;
    }
    return recommended;
  }
}