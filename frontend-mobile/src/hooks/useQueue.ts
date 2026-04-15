import { useAppSelector } from './useRedux';
import { Place } from '../redux/slices/placeSlice';

export interface Ticket {
  id: string;
  shopId: string;
  bookDate?: string;
  bookTime?: string;
  tableType?: string | null;
  status: string;
}

export const useQueue = () => {
  const allPlaces = useAppSelector((state) => state.places.places);
  const allTickets = useAppSelector((state) => state.queue.allTickets);

  const getBusinessDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return '';
    
    if (dateObj.getHours() < 6) {
      dateObj.setDate(dateObj.getDate() - 1);
    }
    
    return dateObj.toISOString().split('T')[0];
  };

  const generatePrefix = (shopName: string, category: string): string => {
    const parts = shopName.split('(');
    const rawName = parts[0].trim();
    const rawBranch = parts.length > 1 ? parts[1].replace(')', '').trim() : '';

    const engOnlyName = rawName.replace(/[^a-zA-Z\s]/g, '').trim();
    const words = engOnlyName.split(/\s+/).filter(w => w.length > 0);
    
    let shopPrefix = '';
    for (let i = 0; i < words.length && shopPrefix.length < 3; i += 2) {
      shopPrefix += words[i][0].toUpperCase();
    }
    if (shopPrefix.length === 0) shopPrefix = 'SHP';

    const engOnlyBranch = rawBranch.replace(/[^a-zA-Z]/g, '').trim();
    const branchPrefix = engOnlyBranch.length > 0 ? engOnlyBranch[0].toUpperCase() : 'X';

    let catTag = 'O';
    if (category === 'ร้านอาหาร') catTag = 'R';
    else if (category === 'คาเฟ่') catTag = 'C';
    else if (category === 'Beauty') catTag = 'B';

    return `${shopPrefix}${branchPrefix}${catTag}`;
  };

  const generateTicketId = (shopId: string, dateString: string) => {
    const shop = allPlaces.find((p: Place) => p.id === shopId);
    if (!shop) return `Q-${Math.floor(Math.random() * 1000)}`;

    const displayPrefix = generatePrefix(shop.name, shop.category);
    const targetBusinessDate = getBusinessDate(dateString);
    
    const shopTickets = allTickets.filter((t: Ticket) => {
      if (t.shopId !== shopId) return false;
      const ticketBizDate = getBusinessDate(t.bookDate);
      return ticketBizDate === targetBusinessDate;
    });
    
    let maxQueueNum = 0;
    shopTickets.forEach((t: Ticket) => {
      const parts = t.id.toUpperCase().split('-CM'); 
      if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxQueueNum) { 
          maxQueueNum = num; 
        }
      }
    });

    let nextQueueNum = maxQueueNum + 1;
    let newId = `${displayPrefix}-CM${String(nextQueueNum).padStart(3, '0')}`;
    
    while (allTickets.some((t: Ticket) => t.id === newId)) {
      nextQueueNum++;
      newId = `${displayPrefix}-CM${String(nextQueueNum).padStart(3, '0')}`;
    }
    
    return newId;
  };

  const getAvailableTable = (shopId: string, guestCount: number, dateString: string, timeString: string) => {
    const shop = allPlaces.find((p: Place) => p.id === shopId);
    if (!shop || !shop.tableTypes) return null;

    const suitableTables = [...shop.tableTypes]
      .filter((t) => t.capacity >= guestCount)
      .sort((a, b) => a.capacity - b.capacity);

    if (suitableTables.length === 0) return null;

    for (const table of suitableTables) {
      const sameSlotBookings = allTickets.filter((t: Ticket) =>
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

  const getQueueDetails = (ticket: Ticket) => {
    const shop = allPlaces.find((p: Place) => p.id === ticket.shopId);
    if (!shop) return { shop: null, queuesAhead: 0, estimatedWaitTime: 0 };

    const targetBusinessDate = getBusinessDate(ticket.bookDate);

    const aheadTickets = allTickets.filter((t: Ticket) => {
      if (t.shopId !== ticket.shopId) return false;
      const ticketBizDate = getBusinessDate(t.bookDate);
      
      const isSameDay = targetBusinessDate !== '' && ticketBizDate === targetBusinessDate;
      const isEarlier = t.bookTime && ticket.bookTime && t.bookTime < ticket.bookTime;
      const isActive = t.status === 'Waiting' || t.status === 'Serving';

      return isSameDay && isEarlier && isActive;
    });

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