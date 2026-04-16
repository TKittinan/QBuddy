import { useAppSelector } from './useRedux';
import { Place, Ticket } from '../types'; // 🌟 ดึงจากตัวกลาง

export const useQueue = () => {
  const allPlaces = useAppSelector((state) => state.places.places);
  const tickets = useAppSelector((state) => state.queue.tickets);

  const getBusinessDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return '';
    if (dateObj.getHours() < 6) dateObj.setDate(dateObj.getDate() - 1);
    return dateObj.toISOString().split('T')[0];
  };

  const generateTicketId = (shopId: string, dateString: string, timeString: string): string => {
    const shop = allPlaces.find((p: Place) => p.id === shopId);
    const category = shop?.category || "General";
    const typeCode = category === 'ร้านอาหาร' ? 'R' : category === 'คาเฟ่' ? 'C' : 'B';
    
    const todayTickets = tickets.filter((t: Ticket) => t.shopId === shopId && t.bookDate?.startsWith(dateString));
    const runningNumber = (todayTickets.length + 1).toString().padStart(3, '0');
    
    return `${typeCode}-${runningNumber}`;
  };

  const getQueueDetails = (ticket: Ticket) => {
    const shop = allPlaces.find((p: Place) => p.id === ticket.shopId);
    if (!shop) return { shop: null, queuesAhead: 0, estimatedWaitTime: 0 };

    const targetBusinessDate = getBusinessDate(ticket.bookDate);
    const aheadTickets = tickets.filter((t: Ticket) => {
      if (t.shopId !== ticket.shopId) return false;
      const isSameDay = targetBusinessDate !== '' && getBusinessDate(t.bookDate) === targetBusinessDate;
      const isEarlier = t.bookTime < ticket.bookTime;
      const isActive = t.status === 'Waiting' || t.status === 'Serving';
      return isSameDay && isEarlier && isActive;
    });

    return { 
      shop, 
      queuesAhead: aheadTickets.length, 
      estimatedWaitTime: aheadTickets.length * (shop.avgServiceTime || 15) 
    };
  };

  return { generateTicketId, getQueueDetails };
};