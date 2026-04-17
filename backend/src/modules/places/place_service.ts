import { supabase } from '../../config/supabase';

export class PlaceService {
  // 1. ดึงข้อมูล Place ทั้งหมด พร้อมข้อมูล TableType
  async get_all_places() {
    const { data, error } = await supabase
      .from('Place')
      .select('*, TableType(*)'); 

    if (error) throw new Error(error.message);
    return data;
  }

  // 2. ค้นหา Place ด้วย ID
  async get_place_by_id(id: string) {
    const { data, error } = await supabase
      .from('Place')
      .select('*, TableType(*)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  // 3. สร้าง Place ใหม่
  async create_place(data: any) {
    const { id, table_types, TableType, tags, ...place_data } = data;

    const { data: newPlace, error: placeError } = await supabase
      .from('Place')
      .insert([place_data]) 
      .select()
      .single();

    if (placeError) throw new Error(placeError.message);

    // บันทึกข้อมูลประเภทโต๊ะลงตาราง TableType พร้อมส่ง label ไปด้วย
    if (table_types && table_types.length > 0) {
      const tableTypesToInsert = table_types.map((tt: any) => ({
        name: tt.name,
        label: tt.label, // 🌟 เพิ่มบรรทัดนี้
        capacity: tt.capacity,
        placeId: newPlace.id 
      }));

      const { error: ttError } = await supabase
        .from('TableType')
        .insert(tableTypesToInsert);

      if (ttError) throw new Error(ttError.message);
    }

    return await this.get_place_by_id(newPlace.id);
  }

  // 4. อัปเดตข้อมูล Place
  async update_place(id: string, data: any) {
    const { table_types, TableType, tags, ...place_data } = data;

    const { data: updatedPlace, error: placeError } = await supabase
      .from('Place')
      .update(place_data)
      .eq('id', id)
      .select()
      .single();

    if (placeError) throw new Error(placeError.message);

    if (table_types) {
      await supabase.from('TableType').delete().eq('placeId', id);
      
      if (table_types.length > 0) {
        const tableTypesToInsert = table_types.map((tt: any) => ({
          name: tt.name,
          label: tt.label, // 🌟 เพิ่มบรรทัดนี้
          capacity: tt.capacity,
          placeId: id
        }));
        const { error: ttError } = await supabase.from('TableType').insert(tableTypesToInsert);
        if (ttError) throw new Error(ttError.message);
      }
    }

    return await this.get_place_by_id(id);
  }

  // 5. ลบ Place
  async delete_place(id: string) {
    const { error } = await supabase
      .from('Place')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }

  // 6. AI Recommendation
  async get_ai_recommendations(user_name: string) {
    const { data: history, error: historyError } = await supabase
      .from('Ticket')
      .select('*, place:Place(*)') 
      .eq('name', user_name)
      .eq('status', 'Completed');

    if (historyError) throw new Error(historyError.message);

    if (!history || history.length === 0) {
      const { data: recommended } = await supabase
        .from('Place').select('*').eq('status', 'Active').limit(5); 
      return recommended;
    }
    
    const categories = history.flatMap((h: any) => h.place?.category?.split(',') || []);
    const uniqueFavoriteCats = [...new Set(categories)];
    const visited_place_ids = history.map((h: any) => h.placeId);

    let { data: recommended, error: recError } = await supabase
      .from('Place')
      .select('*')
      .eq('status', 'Active')
      .not('id', 'in', `(${visited_place_ids.join(',')})`)
      .ilike('category', `%${uniqueFavoriteCats[0]}%`) 
      .limit(5);

    if (recError || !recommended || recommended.length === 0) {
      const { data: fallback } = await supabase
        .from('Place').select('*').eq('status', 'Active').limit(5);
      return fallback;
    }

    return recommended;
  }
}