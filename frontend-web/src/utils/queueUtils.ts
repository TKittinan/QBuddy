import type { Place, Ticket } from "../types";

export const getBusinessDate = (dateString?: string): string => {
  if (!dateString) return "";
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return "";
  if (dateObj.getHours() < 6) {
    dateObj.setDate(dateObj.getDate() - 1);
  }
  return dateObj.toISOString().split("T")[0];
};

export const generateShopPrefix = (shopName: string, category: string): string => {
  const parts = shopName.split("(");
  const rawName = parts[0].trim();
  const rawBranch = parts.length > 1 ? parts[1].replace(")", "").trim() : "";

  const engOnlyName = rawName.replace(/[^a-zA-Z\s]/g, "").trim();
  const words = engOnlyName.split(/\s+/).filter(w => w.length > 0);
  
  let shopPrefix = "";
  for (let i = 0; i < words.length && shopPrefix.length < 3; i += 2) {
    shopPrefix += words[i][0].toUpperCase();
  }
  if (shopPrefix.length === 0) shopPrefix = "SHP";

  const engOnlyBranch = rawBranch.replace(/[^a-zA-Z]/g, "").trim();
  const branchPrefix = engOnlyBranch.length > 0 ? engOnlyBranch[0].toUpperCase() : "X";

  let catTag = "O";
  if (category === "ร้านอาหาร") catTag = "R";
  else if (category === "คาเฟ่") catTag = "C";
  else if (category === "Beauty") catTag = "B";

  return `${shopPrefix}${branchPrefix}${catTag}`;
};

export const generateGlobalTicketId = (
  shopId: string, 
  dateString: string, 
  allPlaces: Place[], 
  allTickets: Ticket[]
): string => {
  const shop = allPlaces.find((p) => p.id === shopId);
  if (!shop) return `Q-${Math.floor(Math.random() * 1000)}`;

  const displayPrefix = generateShopPrefix(shop.name, shop.category);
  const targetBusinessDate = getBusinessDate(dateString);
  
  const shopTickets = allTickets.filter((t) => {
    if (t.shopId !== shopId) return false;
    return getBusinessDate(t.bookDate || t.createdAt) === targetBusinessDate;
  });
  
  let maxQueueNum = 0;
  shopTickets.forEach((t) => {
    const parts = t.id.toUpperCase().split("-CM"); 
    if (parts.length === 2) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxQueueNum) { 
        maxQueueNum = num; 
      }
    }
  });

  const nextQueueNum = maxQueueNum + 1;
  let newId = `${displayPrefix}-CM${String(nextQueueNum).padStart(3, "0")}`;
  
  while (allTickets.some((t) => t.id === newId)) {
    const retryNum = nextQueueNum + 1;
    newId = `${displayPrefix}-CM${String(retryNum).padStart(3, "0")}`;
  }
  
  return newId;
};

export const getQueueDetails = (ticket: Ticket, allPlaces: Place[], allTickets: Ticket[]) => {
  const shop = allPlaces.find((p) => p.id === ticket.shopId);
  if (!shop) return { shop: null, queuesAhead: 0, estimatedWaitTime: 0 };

  const targetBusinessDate = getBusinessDate(ticket.bookDate || ticket.createdAt);

  const aheadTickets = allTickets.filter((t) => {
    if (t.shopId !== ticket.shopId) return false;
    const ticketBizDate = getBusinessDate(t.bookDate || t.createdAt);
    
    const isSameDay = targetBusinessDate !== "" && ticketBizDate === targetBusinessDate;
    const isEarlier = t.createdAt < ticket.createdAt; 
    const isActive = t.status === "Waiting" || t.status === "Serving";

    return isSameDay && isEarlier && isActive;
  });

  const queuesAhead = ticket.status === "Serving" ? 0 : aheadTickets.length; 
  const estimatedWaitTime = queuesAhead * (shop.avgServiceTime || 15);

  return { shop, queuesAhead, estimatedWaitTime };
};