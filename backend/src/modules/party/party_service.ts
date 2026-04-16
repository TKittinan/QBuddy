import { prisma } from '../../lib/prisma';
import { ActivityStatus } from '@prisma/client';

export class PartyService {
  // ดึงปาร์ตี้ทั้งหมด พร้อมข้อมูล Host และร้านค้า
  async get_all_parties() {
    return await prisma.partyActivity.findMany({
      include: {
        host: { select: { name: true, avatarUrl: true } },
        place: { select: { name: true, branch: true } },
        joinedGuests: true
      }
    });
  }

  // สร้างปาร์ตี้ใหม่
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

  // ระบบคนขอเข้าร่วมปาร์ตี้ (Guest)
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