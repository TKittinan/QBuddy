import { supabase } from '../../config/supabase';

export class PlaceService {
  async get_all_places() {
    const { data, error } = await supabase.from('Place').select('*, tableTypes:TableType(*)'); 
    if (error) throw new Error(error.message);
    return data;
  }

  // ฟังก์ชันใหม่สำหรับ AI Chatbot ดึงข้อมูลไปวิเคราะห์
  async findAll() {
    try {
      const { data, error } = await supabase
        .from('Place')
        .select('name, type, description');
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("Error in findAll places:", error);
      throw new Error("Could not fetch places data for AI");
    }
  }

  async get_place_by_id(id: string) {
    const { data, error } = await supabase.from('Place').select('*, tableTypes:TableType(*)').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data;
  }

  private get_shop_prefix(name: string): string {
    const cleanName = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    const words = cleanName.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return 'XX';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }

  private get_branch_prefix(branch?: string): string {
    if (!branch || branch.trim() === '') return '';
    const cleanBranch = branch.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    const words = cleanBranch.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return '';
    return words[0][0].toUpperCase();
  }

  async create_place(data: any) {
    const { id, table_types, tags, ...place_data } = data;
    const firstCategory = (place_data.category || '').split(',')[0].trim().toLowerCase();
    const shopNameLower = (place_data.name || '').trim().toLowerCase();

    const { data: existingShops, error: checkError } = await supabase
      .from('Place')
      .select('id, name, category');
    
    if (checkError) throw new Error(checkError.message);

    const sameShops = (existingShops || []).filter(shop => {
      const sName = (shop.name || '').trim().toLowerCase();
      const sCat = (shop.category || '').split(',')[0].trim().toLowerCase();
      return sName === shopNameLower && sCat === firstCategory;
    });

    const branchNumberStr = (sameShops.length + 1).toString().padStart(3, '0');
    const shopPrefix = this.get_shop_prefix(place_data.name);
    const branchPrefix = this.get_branch_prefix(place_data.branch);
    const generatedPlaceId = `${shopPrefix}${branchPrefix}-${branchNumberStr}`;

    place_data.id = generatedPlaceId;

    const { data: newPlace, error: placeError } = await supabase
      .from('Place')
      .insert([place_data]) 
      .select()
      .single();

    if (placeError) {
      if (placeError.code === '23505') throw new Error(`รหัสร้าน ${generatedPlaceId} ซ้ำ`);
      throw new Error(placeError.message);
    }

    if (table_types && table_types.length > 0) {
      const tableTypesToInsert = table_types.map((tt: any) => ({
        label: tt.label, 
        capacity: tt.capacity,
        placeId: newPlace.id 
      }));
      await supabase.from('TableType').insert(tableTypesToInsert);
    }
    return await this.get_place_by_id(newPlace.id);
  }

  async update_place(id: string, data: any) {
    const { table_types, tableTypes, TableType, tags, ...place_data } = data;
    const { error: placeError } = await supabase.from('Place').update(place_data).eq('id', id);
    if (placeError) throw new Error(placeError.message);

    const targetTables = table_types || tableTypes || TableType;
    if (targetTables) {
      await supabase.from('TableType').delete().eq('placeId', id);
      if (targetTables.length > 0) {
        const tableTypesToInsert = targetTables.map((tt: any) => ({
          label: tt.label, capacity: tt.capacity, placeId: id
        }));
        await supabase.from('TableType').insert(tableTypesToInsert);
      }
    }
    return await this.get_place_by_id(id);
  }

  async delete_place(id: string) {
    await supabase.from('TableType').delete().eq('placeId', id);
    const { error } = await supabase.from('Place').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  async get_ai_recommendations(user_name: string) {
    const { data: history, error: historyError } = await supabase
      .from('Ticket')
      .select('*, place:Place(*)')
      .eq('name', user_name)
      .eq('status', 'Completed');
      
    if (historyError) throw new Error(historyError.message);
    if (!history || history.length === 0) {
      return (await supabase.from('Place').select('*').eq('status', 'Active').limit(5)).data;
    }
    const categories = history.flatMap((h: any) => h.place?.category?.split(',') || []);
    const uniqueFavoriteCats = [...new Set(categories)];
    const visited_place_ids = history.map((h: any) => h.placeId);
    
    const { data: recommended } = await supabase
      .from('Place')
      .select('*')
      .eq('status', 'Active')
      .not('id', 'in', `(${visited_place_ids.join(',')})`)
      .ilike('category', `%${uniqueFavoriteCats[0]}%`)
      .limit(5);
      
    return recommended || (await supabase.from('Place').select('*').eq('status', 'Active').limit(5)).data;
  }

  // 🌟 ฟังก์ชันใหม่: คำนวณยอดจองฮิต 7 วันล่าสุด
  async get_weekly_trending() {
    // 1. หาวันที่ย้อนหลัง 7 วัน
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const isoDate = sevenDaysAgo.toISOString();

    // 2. ดึงตั๋วที่มีการจองในรอบ 7 วัน (อ้างอิงจากวันที่สร้าง)
    const { data: tickets, error: ticketError } = await supabase
      .from('Ticket')
      .select('shopId')
      .gte('created_at', isoDate);

    if (ticketError) throw new Error(ticketError.message);

    if (!tickets || tickets.length === 0) return []; // ถ้าสัปดาห์นี้ไม่มีคนจองเลย

    // 3. นับจำนวนการจองของแต่ละร้าน
    const shopCounts: { [key: string]: number } = {};
    tickets.forEach((t: any) => {
      if (t.shopId) {
        shopCounts[t.shopId] = (shopCounts[t.shopId] || 0) + 1;
      }
    });

    // 4. เรียงลำดับร้านที่ถูกจองเยอะสุด 10 อันดับแรก
    const top10ShopIds = Object.keys(shopCounts)
      .sort((a, b) => shopCounts[b] - shopCounts[a])
      .slice(0, 10);
      
    if (top10ShopIds.length === 0) return [];

    // 5. ดึงข้อมูลร้านค้าทั้ง 10 ร้าน (เฉพาะร้านที่ Active)
    const { data: places, error: placeError } = await supabase
      .from('Place')
      .select('*')
      .in('id', top10ShopIds)
      .eq('status', 'Active');

    if (placeError) throw new Error(placeError.message);

    // 6. ประกอบร่างข้อมูลร้าน + ยอดจองรายสัปดาห์ แล้วเรียงลำดับให้ถูกต้องตามยอดจอง
    const trendingPlaces = top10ShopIds.map(id => {
      const place = places?.find(p => p.id === id);
      if (place) {
        // แปะ weeklyBookings เข้าไปใน Object ด้วย
        return { ...place, weeklyBookings: shopCounts[id] };
      }
      return null;
    }).filter(Boolean);

    return trendingPlaces;
  }
}