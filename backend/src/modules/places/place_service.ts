import { supabase } from '../../config/supabase';

export class PlaceService {
  async get_all_places() {
    const { data, error } = await supabase.from('Place').select('*, tableTypes:TableType(*)'); 
    if (error) throw new Error(error.message);
    return data;
  }

  async findAll() {
    try {
      const { data, error } = await supabase
        .from('Place')
        .select('name, category, description, coverUrl, logoUrl');
      
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

  // 🌟 ลอจิกใหม่สุดเป๊ะ: สร้าง Place ID แบบ SMP-001
  private generate_place_id_string(name: string, branch?: string, branchNumber: number = 1): string {
    const cleanName = (name || '').trim().replace(/[^a-zA-Zก-ฮ0-9\s]/g, '');
    const words = cleanName.split(/\s+/).filter(w => w.length > 0);
    
    let shopPrefix = 'XX';
    if (words.length === 1) {
      shopPrefix = words[0].substring(0, 2).toUpperCase();
    } else if (words.length >= 2) {
      // เอาตัวแรกของคำแรก + ตัวแรกของคำสุดท้าย
      shopPrefix = (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }

    let branchPrefix = 'X';
    if (branch && branch.trim() !== '') {
      const cleanBranch = branch.trim().replace(/[^a-zA-Zก-ฮ0-9\s]/g, '');
      const bWords = cleanBranch.split(/\s+/).filter(w => w.length > 0);
      if (bWords.length > 0) {
        branchPrefix = bWords[0][0].toUpperCase();
      }
    }

    // รวมร่าง: ตัวแรกคำแรก(S) + ตัวแรกคำท้าย(M) + ตัวแรกสาขา(P) = SMP
    const finalPrefix = `${shopPrefix}${branchPrefix}`.substring(0, 3);
    const branchNumberStr = branchNumber.toString().padStart(3, '0');
    
    return `${finalPrefix}-${branchNumberStr}`; // ตัวอย่าง: SMP-001
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

    const currentBranchNum = sameShops.length + 1;
    
    // สร้าง ID ร้าน
    const generatedPlaceId = this.generate_place_id_string(place_data.name, place_data.branch, currentBranchNum);

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

  async get_weekly_trending() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const isoDate = sevenDaysAgo.toISOString();

    const { data: tickets, error: ticketError } = await supabase
      .from('Ticket')
      .select('shopId')
      .gte('createdAt', isoDate);

    if (ticketError) throw new Error(ticketError.message);
    if (!tickets || tickets.length === 0) return []; 

    const shopCounts: { [key: string]: number } = {};
    tickets.forEach((t: any) => {
      if (t.shopId) {
        shopCounts[t.shopId] = (shopCounts[t.shopId] || 0) + 1;
      }
    });

    const topShopIds = Object.keys(shopCounts).sort((a, b) => shopCounts[b] - shopCounts[a]);
    if (topShopIds.length === 0) return [];

    const { data: places, error: placeError } = await supabase
      .from('Place')
      .select('*')
      .in('id', topShopIds)
      .eq('status', 'Active');

    if (placeError) throw new Error(placeError.message);

    const trendingPlaces = topShopIds.map(id => {
      const place = places?.find(p => p.id === id);
      if (place) return { ...place, weeklyBookings: shopCounts[id] };
      return null;
    }).filter(Boolean);

    return trendingPlaces;
  }
}