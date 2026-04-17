import { prisma } from '../../lib/prisma';
import { ActivityStatus, PartyActivity, User } from '@prisma/client';

type PartyWithDetails = PartyActivity & {
  host: Partial<User> & { successRate?: number };
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

  async get_all_parties(userLat?: number, userLng?: number, currentUserId?: string): Promise<PartyWithDetails[]> {
    const parties = await prisma.partyActivity.findMany({
      where: {
        status: ActivityStatus.Open,
        ...(currentUserId && { hostId: { not: currentUserId } })
      },
      include: {
        host: { select: { id: true, name: true, avatarUrl: true, interests: true } },
        place: { select: { name: true, branch: true } },
        joinedGuests: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!parties.length) return [];

    const hostIds = [...new Set(parties.map((p: PartyActivity) => p.hostId))];

    const totalStats = await prisma.partyActivity.groupBy({ by: ['hostId'], where: { hostId: { in: hostIds } }, _count: { _all: true } });
    const completedStats = await prisma.partyActivity.groupBy({ by: ['hostId'], where: { hostId: { in: hostIds }, status: 'Completed' }, _count: { _all: true } });

    const successRateMap = new Map<string, number>();
    hostIds.forEach((hostId: string) => {
      const total = totalStats.find((s: any) => s.hostId === hostId)?._count._all || 0;
      const completed = completedStats.find((s: any) => s.hostId === hostId)?._count._all || 0;
      const rate = total > 0 ? (completed / total) * 100 : 0;
      successRateMap.set(hostId, parseFloat(rate.toFixed(0)));
    });

    const currentUser = currentUserId ? await prisma.user.findUnique({ where: { id: currentUserId }, select: { interests: true } }) : null;

    const partiesWithDetails = parties.map((party: any) => {
      const distance = (userLat !== undefined && userLng !== undefined)
        ? parseFloat(this.calculateDistance(userLat, userLng, party.lat, party.lng).toFixed(2))
        : undefined;

      const successRate = successRateMap.get(party.hostId) || 0;
      let matchDetails: { matchRate: number; isRecommended: boolean; } | undefined;
      let sharedInterestsCount: number | undefined;

      if (currentUser && currentUser.interests && party.host.interests && Array.isArray(currentUser.interests) && Array.isArray(party.host.interests)) {
        // 🌟 ใส่ Type ให้ interest ป้องกัน implicit any
        sharedInterestsCount = currentUser.interests.filter((interest: string) => (party.host.interests as string[]).includes(interest)).length;
        // 🌟 แก้ Error undefined (ใส่ || 0 ป้องกันกรณีไม่ได้ค่า)
        matchDetails = this.checkIsAiRecommended(successRate, sharedInterestsCount || 0);
      }

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

    return partiesWithDetails;
  }

  async create_party(data: any) {
    return await prisma.partyActivity.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags,
        meetingDate: data.meeting_date,
        meetingTime: data.meeting_time,
        lat: data.lat,
        lng: data.lng,
        maxGuests: data.max_guests,
        status: ActivityStatus.Open, 
        hostId: data.host_id,
        placeId: data.place_id
      }
    });
  }

  async join_party(data: { activity_id: string; user_id: string; pax: number }) {
    return await prisma.guest.create({
      data: {
        activityId: data.activity_id,
        userId: data.user_id,
        pax: data.pax,
        status: 'pending'
      }
    });
  }
}