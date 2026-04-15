import { useAppSelector } from './useRedux';

export const useQueue = () => {
  const allPlaces = useAppSelector((state: any) => state.places?.places || []);
  const allTickets = useAppSelector((state: any) => state.queue?.allTickets || []);

  // 🌟 1. ฟังก์ชันสร้าง Ticket ID (เช่น CBB-R-001)
  const generateTicketId = (shopId: string, dateString: string) => {
    const shop = allPlaces.find((p: any) => p.id === shopId);
    if (!shop) return `Q-${Math.floor(Math.random() * 1000)}`;

    const shopPrefix = shop.name.split(' ').map((w: string) => w.charAt(0)).join('').toUpperCase().substring(0, 3);
    const tagPrefix = shop.category === 'ร้านอาหาร' ? 'R' : shop.category === 'คาเฟ่' ? 'C' : 'B'; 
    
    const todaysTickets = allTickets.filter((t: any) => t.shopId === shopId && t.bookDate?.startsWith(dateString));
    const queueNumber = String(todaysTickets.length + 1).padStart(3, '0');
    
    return `${shopPrefix}-${tagPrefix}-${queueNumber}`;
  };

  // 🌟 2. ฟังก์ชันหาโต๊ะว่าง (Table Mapping)
  const getAvailableTable = (shopId: string, guestCount: number, dateString: string, timeString: string) => {
    const shop = allPlaces.find((p: any) => p.id === shopId);
    if (!shop || !shop.tableTypes) return null;

    const suitableTables = [...shop.tableTypes]
      .filter((t: any) => t.capacity >= guestCount)
      .sort((a: any, b: any) => a.capacity - b.capacity);

    if (suitableTables.length === 0) return null;

    for (const table of suitableTables) {
      // เช็คว่ามีคนจองไป 2 คิวหรือยัง (จำลองรับได้ 2 คิวต่อไซส์)
      const sameSlotBookings = allTickets.filter((t: any) =>
        t.shopId === shopId &&
        t.bookDate?.startsWith(dateString) &&
        t.bookTime === timeString &&
        t.tableType === table.id &&
        (t.status === 'Waiting' || t.status === 'Serving')
      );

      if (sameSlotBookings.length < 2) return table; 
    }

    return null; 
  };

  // 🌟 3. ฟังก์ชันคำนวณคิวและเวลารอ
  const getQueueDetails = (ticket: any) => {
    const shop = allPlaces.find((p: any) => p.id === ticket.shopId);
    if (!shop) return { shop: null, queuesAhead: 0, estimatedWaitTime: 0 };

    const dateString = ticket.bookDate?.split('T')[0];
    const aheadTickets = allTickets.filter((t: any) => 
      t.shopId === ticket.shopId &&
      t.bookDate?.startsWith(dateString) &&
      t.bookTime < ticket.bookTime && 
      (t.status === 'Waiting' || t.status === 'Serving')
    );

    const queuesAhead = ticket.status === 'Serving' ? 0 : aheadTickets.length; 
    const estimatedWaitTime = queuesAhead * (shop.avgServiceTime || 15);

    return { shop, queuesAhead, estimatedWaitTime };
  };

  return {
    generateTicketId,
    getAvailableTable,
    getQueueDetails
  };
};