import { useAppSelector } from './useRedux';

export const useQueue = () => {
  const allPlaces = useAppSelector((state: any) => state.places?.places || []);
  const allTickets = useAppSelector((state: any) => state.queue?.allTickets || []);

  // 🌟 1. ฟังก์ชันสร้าง Ticket ID (ลอจิกเดียวกับ Web Admin 100%)
  const generateTicketId = (shopId: string, dateString: string) => {
    const shop = allPlaces.find((p: any) => p.id === shopId);
    if (!shop) return `Q-${Math.floor(Math.random() * 1000)}`;

    // =======================================================
    // 🌟 ถอดรหัส Place ID ให้กลายเป็น Prefix (เหมือนโค้ด Admin)
    // =======================================================
    const rawPlaceId = (shop.placeId || '#XX-X-001').replace('#', ''); // เช่น "CT-R-001"
    const idParts = rawPlaceId.split('-'); 
    let displayPrefix = rawPlaceId;
    
    if (idParts.length >= 3) {
      const namePart = idParts[0]; // "CT"
      const catPart = idParts[1]; // "R"
      const seqPart = parseInt(idParts[2], 10); // 1
      displayPrefix = `${namePart}${catPart}${seqPart}`; // ประกอบเป็น "CTR1"
    } else {
      displayPrefix = rawPlaceId.replace(/-/g, ''); 
    }

    // 🌟 ดึงคิวทั้งหมดของร้านนี้ในวันนี้
    const shopTickets = allTickets.filter((t: any) => t.shopId === shopId && t.bookDate?.startsWith(dateString));
    
    // 🌟 หาหมายเลขคิวสูงสุดที่เคยมีในวันนี้ (เผื่อมีคิวข้ามเลข จะได้รันต่อให้ถูก)
    let maxQueueNum = 0;
    shopTickets.forEach((t: any) => {
      // ตัดคำด้วย -CTM ตามฟอร์แมต
      const parts = t.id.toUpperCase().split('-CTM'); 
      if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxQueueNum) { 
          maxQueueNum = num; 
        }
      }
    });

    let nextQueueNum = maxQueueNum + 1;
    let newId = `${displayPrefix}-CTM${String(nextQueueNum).padStart(3, '0')}`;
    
    // 🛡️ เช็คความชัวร์ชั้นที่ 2 ป้องกัน ID ชนกันในระบบ
    while (allTickets.some((t: any) => t.id === newId)) {
      nextQueueNum++;
      newId = `${displayPrefix}-CTM${String(nextQueueNum).padStart(3, '0')}`;
    }
    
    return newId;
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