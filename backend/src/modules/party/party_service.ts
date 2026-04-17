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

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private checkIsAiRecommended(successRate: number, sharedInterests: number): { matchRate: number; isRecommended: boolean; } {
    let matchScore = 50 + (sharedInterests * 10);
    if (successRate >= 85) matchScore += 25;
    const finalScore = Math.min(99, matchScore);
    return {
      matchRate: finalScore,
      isRecommended: finalScore >= 85 && successRate >= 85
    };
  }

  // --- แปลงเป็น Supabase ---
  async get_all_parties(userLat?: number, userLng?: number, currentUserId?: string): Promise<PartyWithDetails[]> {
    let query = supabase
      .from('partyActivities') // ชื่อ Table ใน Supabase
      .select(`
        *,
        host:users!hostId (id, name, avatarUrl, interests),
        place:places (name, branch),
        joinedGuests:guests (*)
      `)
      .eq('status', 'Open')
      .order('createdAt', { ascending: false });

    if (currentUserId) {
      query = query.neq('hostId', currentUserId);
    }

    const { data: parties, error } = await query;
    if (error || !parties || parties.length === 0) return [];

    // ดึงสถิติเพื่อคำนวณ Success Rate (ใช้ RPC หรือดึงมา Group เอง)
    const hostIds = [...new Set(parties.map((p: any) => p.hostId))];
    
    // ดึงข้อมูลกิจกรรมทั้งหมดของ Host เหล่านี้มาคำนวณ Success Rate
    const { data: allStats } = await supabase
      .from('partyActivities')
      .select('hostId, status')
      .in('hostId', hostIds);

    const successRateMap = new Map<string, number>();
    hostIds.forEach((hostId) => {
      const hostActivities = allStats?.filter(a => a.hostId === hostId) || [];
      const total = hostActivities.length;
      const completed = hostActivities.filter(a => a.status === 'Completed').length;
      const rate = total > 0 ? (completed / total) * 100 : 0;
      successRateMap.set(hostId, Math.round(rate));
    });

    // ดึงข้อมูลความสนใจของ User ปัจจุบัน
    let currentUserInterests: string[] = [];
    if (currentUserId) {
      const { data: userData } = await supabase
        .from('users')
        .select('interests')
        .eq('id', currentUserId)
        .single();
      currentUserInterests = userData?.interests || [];
    }

    // Map ข้อมูลกลับไปพร้อมการคำนวณ
    return parties.map((party: any) => {
      const distance = (userLat !== undefined && userLng !== undefined)
        ? parseFloat(this.calculateDistance(userLat, userLng, party.lat, party.lng).toFixed(2))
        : undefined;

      const successRate = successRateMap.get(party.hostId) || 0;
      let sharedInterestsCount = 0;
      
      if (currentUserInterests.length > 0 && party.host?.interests) {
        sharedInterestsCount = currentUserInterests.filter((i: string) => 
          party.host.interests.includes(i)
        ).length;
      }

      const matchDetails = this.checkIsAiRecommended(successRate, sharedInterestsCount);

      return {
        ...party,
        distance,
        host: {
          ...party.host,
          successRate,
        },
        sharedInterests: sharedInterestsCount,
        ...matchDetails,
      };
    });
  }

  async create_party(data: any) {
    const { data: newParty, error } = await supabase
      .from('partyActivities')
      .insert([{
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags,
        meetingDate: data.meeting_date,
        meetingTime: data.meeting_time,
        lat: data.lat,
        lng: data.lng,
        maxGuests: data.max_guests,
        status: 'Open',
        hostId: data.host_id,
        placeId: data.place_id
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return newParty;
  }

  async join_party(data: { activity_id: string; user_id: string; pax: number }) {
    const { data: joinData, error } = await supabase
      .from('guests')
      .insert([{
        activityId: data.activity_id,
        userId: data.user_id,
        pax: data.pax,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return joinData;
  }


  async delete_party(id: string) {
    const { error } = await supabase
      .from('partyActivities')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }
}