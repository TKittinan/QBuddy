import { supabase } from '../../config/supabase';

type PartyWithDetails = any & {
  host: any & { successRate?: number };
  place: { name: string, branch: string | null };
  joinedGuests: any[];
  distance?: number;
  matchRate?: number;
  isRecommended?: boolean;
  sharedInterests?: number;
};

export class PartyService {
  /* คำนวณระยะทางระหว่างพิกัด */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /* ตรวจสอบเงื่อนไข AI แนะนำ */
  private checkIsAiRecommended(successRate: number, sharedInterests: number): { matchRate: number; isRecommended: boolean; } {
    let matchScore = 60 + (sharedInterests * 15);
    if (successRate >= 85) matchScore += 20;
    const finalScore = Math.min(99, matchScore);
    return {
      matchRate: finalScore,
      isRecommended: finalScore >= 85 && successRate >= 85
    };
  }

  /* ดึงรายการกิจกรรมทั้งหมด */
  async get_all_parties(userLat?: number, userLng?: number, currentUserId?: string): Promise<PartyWithDetails[]> {
    /* ดึงข้อมูลจาก PartyActivity โดยไม่กรอง hostId ออก เพื่อให้เจ้าของโพสต์เห็นประกาศของตนเอง */
    let query = supabase.from('PartyActivity').select(`*, host:User!hostId (id, name, avatarUrl, interests), place:Place (name, branch), joinedGuests:Guest (*)`).eq('status', 'Open').order('createdAt', { ascending: false });
    
    const { data: parties, error } = await query;
    
    if (error) {
      console.error("GET PARTIES ERROR:", error);
      return [];
    }
    if (!parties || parties.length === 0) return [];

    const hostIds = [...new Set(parties.map((p: any) => p.hostId))];
    const { data: allStats } = await supabase.from('PartyActivity').select('hostId, status').in('hostId', hostIds);
    const successRateMap = new Map<string, number>();
    hostIds.forEach((hostId) => {
      const hostActivities = allStats?.filter(a => a.hostId === hostId) || [];
      const total = hostActivities.length;
      const completed = hostActivities.filter(a => a.status === 'Completed').length;
      const rate = total > 0 ? (completed / total) * 100 : 0;
      successRateMap.set(hostId, Math.round(rate));
    });

    let currentUserInterests: string[] = [];
    if (currentUserId) {
      const { data: userData } = await supabase.from('User').select('interests').eq('id', currentUserId).single();
      currentUserInterests = userData?.interests || [];
    }

    return parties.map((party: any) => {
      const distance = (userLat !== undefined && userLng !== undefined) ? parseFloat(this.calculateDistance(userLat, userLng, party.lat, party.lng).toFixed(2)) : undefined;
      const successRate = successRateMap.get(party.hostId) || 0;
      let sharedInterestsCount = 0;
      if (currentUserInterests.length > 0 && party.host?.interests) {
        sharedInterestsCount = currentUserInterests.filter((i: string) => party.host.interests.includes(i)).length;
      }
      const matchDetails = this.checkIsAiRecommended(successRate, sharedInterestsCount);
      return { ...party, distance, host: { ...party.host, successRate }, sharedInterests: sharedInterestsCount, ...matchDetails };
    });
  }

  /* ยืนยันผู้เข้าร่วม */
  async confirm_guest(activityId: string, userId: string) {
    const { data: guest, error: guestError } = await supabase.from('Guest').update({ status: 'confirmed' }).eq('activityId', activityId).eq('userId', userId).select().single();
    if (guestError) throw new Error(guestError.message);

    const { data: party } = await supabase.from('PartyActivity').select('*, joinedGuests:Guest(*)').eq('id', activityId).single();
    if (party) {
      const confirmedSum = party.joinedGuests?.filter((g: any) => g.status === 'confirmed').reduce((sum: number, g: any) => sum + g.pax, 0) || 0;
      if (confirmedSum >= (party.maxGuests || 0)) {
        await supabase.from('PartyActivity').update({ status: 'Closed' }).eq('id', activityId);
      }
    }
    return guest;
  }

  /* สร้างกิจกรรมใหม่ */
  async create_party(data: any) {
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags || [],
      meetingDate: data.meetingDate || data.meeting_date,
      meetingTime: data.meetingTime || data.meeting_time,
      lat: data.lat || 0,
      lng: data.lng || 0,
      maxGuests: data.maxGuests || data.max_guests,
      status: data.status || 'Open',
      hostId: data.hostId || data.host_id,
      placeId: data.placeId || data.place_id,
      bookingId: data.bookingId || null
    };

    console.log("Data sending to Supabase:", payload);

    const { data: newParty, error } = await supabase
      .from('PartyActivity')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("CREATE PARTY ERROR:", error);
      throw new Error(error.message);
    }
    return newParty;
  }

  /* เข้าร่วมกิจกรรม */
  async join_party(data: { activity_id: string; user_id: string; pax: number }) {
    const { data: joinData, error } = await supabase.from('Guest').insert([{ activityId: data.activity_id, userId: data.user_id, pax: data.pax, status: 'pending' }]).select().single();
    if (error) throw new Error(error.message);
    return joinData;
  }

  /* ลบกิจกรรม */
  async delete_party(id: string) {
    const { error } = await supabase.from('PartyActivity').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }
}