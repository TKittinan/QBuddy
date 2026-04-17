import { prisma } from '../../lib/prisma';

export class PlaceService {
  async get_all_places() {
    return await prisma.place.findMany({ include: { tableTypes: true } });
  }

  async get_place_by_id(id: string) {
    return await prisma.place.findUnique({ where: { id }, include: { tableTypes: true } });
  }

  async create_place(data: any) {
    const { table_types, ...place_data } = data;
    return await prisma.place.create({
      data: {
        ...place_data,
        tableTypes: { create: table_types || [] }
      }
    });
  }

  async get_ai_recommendations(user_name: string) {
    const history = await prisma.ticket.findMany({
      where: { name: user_name, status: 'Completed' },
      include: { place: true }
    });

    if (history.length === 0) {
      return await prisma.place.findMany({
        where: { isRecommended: true, status: 'Active' },
        take: 5
      });
    }

    // 🌟 ใส่ Type (h: any) ให้กับ callback
    const favorite_tags = [...new Set(history.flatMap((h: any) => h.place?.tags || []))];
    const visited_place_ids = history.map((h: any) => h.placeId);

    let recommended = await prisma.place.findMany({
      where: {
        tags: { hasSome: favorite_tags },
        id: { notIn: visited_place_ids },
        status: 'Active'
      },
      take: 5
    });

    if (recommended.length === 0) {
      recommended = await prisma.place.findMany({
        where: { isRecommended: true, status: 'Active' },
        take: 5
      });
    }

    return recommended;
  }
}