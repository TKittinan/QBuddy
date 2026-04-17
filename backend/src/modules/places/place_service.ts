import { supabase } from '../../config/supabase';

export class PlaceService {
  async get_all_places() {
    const { data, error } = await supabase
      .from('places')
      .select('*, tableTypes(*)'); 

    if (error) throw new Error(error.message);
    return data;
  }

  async get_place_by_id(id: string) {
    const { data, error } = await supabase
      .from('places')
      .select('*, tableTypes(*)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async create_place(data: any) {
    const { table_types, ...place_data } = data;

    const { data: newPlace, error: placeError } = await supabase
      .from('places')
      .insert([place_data])
      .select()
      .single();

    if (placeError) throw new Error(placeError.message);

    if (table_types && table_types.length > 0) {
      const tableTypesToInsert = table_types.map((tt: any) => ({
        ...tt,
        placeId: newPlace.id 
      }));

      const { error: ttError } = await supabase
        .from('tableTypes') 
        .insert(tableTypesToInsert);

      if (ttError) throw new Error(ttError.message);
    }

    return await this.get_place_by_id(newPlace.id);
  }

  // --- ฟังก์ชันอัปเดต (เพิ่มเข้าไปเพื่อแก้ Error) ---
  async update_place(id: string, data: any) {
    const { table_types, ...place_data } = data;

    // 1. อัปเดตข้อมูลร้านค้า
    const { data: updatedPlace, error: placeError } = await supabase
      .from('places')
      .update(place_data)
      .eq('id', id)
      .select()
      .single();

    if (placeError) throw new Error(placeError.message);

    // 2. จัดการ tableTypes (ลบของเก่าแล้วลงใหม่เพื่อให้ sync กับข้อมูลล่าสุด)
    if (table_types) {
      await supabase.from('tableTypes').delete().eq('placeId', id);
      
      if (table_types.length > 0) {
        const tableTypesToInsert = table_types.map((tt: any) => ({
          ...tt,
          placeId: id
        }));
        const { error: ttError } = await supabase.from('tableTypes').insert(tableTypesToInsert);
        if (ttError) throw new Error(ttError.message);
      }
    }

    return await this.get_place_by_id(id);
  }

  // --- ฟังก์ชันลบ (เพิ่มเข้าไปเพื่อแก้ Error) ---
  async delete_place(id: string) {
    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }

  async get_ai_recommendations(user_name: string) {
    const { data: history, error: historyError } = await supabase
      .from('tickets')
      .select('*, place:places(*)') 
      .eq('name', user_name)
      .eq('status', 'Completed');

    if (historyError) throw new Error(historyError.message);

    if (!history || history.length === 0) {
      const { data: recommended, error: recError } = await supabase
        .from('places')
        .select('*')
        .eq('isRecommended', true)
        .eq('status', 'Active')
        .limit(5); 

      if (recError) throw new Error(recError.message);
      return recommended;
    }
    
    const favorite_tags = [...new Set(history.flatMap((h: any) => h.place?.tags || []))];
    const visited_place_ids = history.map((h: any) => h.placeId);

    const idsString = `(${visited_place_ids.join(',')})`;

    let { data: recommended, error: recError } = await supabase
      .from('places')
      .select('*')
      .overlaps('tags', favorite_tags) 
      .filter('id', 'not.in', idsString) 
      .eq('status', 'Active')
      .limit(5);

    if (recError) throw new Error(recError.message);

    if (!recommended || recommended.length === 0) {
      const { data: fallback, error: fallbackError } = await supabase
        .from('places')
        .select('*')
        .eq('isRecommended', true)
        .eq('status', 'Active')
        .limit(5);

      if (fallbackError) throw new Error(fallbackError.message);
      recommended = fallback;
    }

    return recommended;
  }
}