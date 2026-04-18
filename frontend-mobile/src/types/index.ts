export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: string;
  createdAt: string;
  ai_consented?: boolean;
  aiConsented?: boolean; 
}

export interface TableType {
  id: string;
  label: string;
  capacity: number;
}

export interface Place {
  id: string;
  placeId?: string;
  name: string;
  branch: string;
  category: string;
  description?: string;
  tags?: string[];
  image?: string;
  logoUrl?: string;
  coverUrl?: string;
  coverUrls?: string[];
  avgServiceTime?: number;
  openTime?: string;
  closeTime?: string;
  lat?: number;
  lng?: number;
  monthlyBookings?: number;
  phone?: string;
  status?: "Active" | "Inactive" | string;
  tableTypes?: TableType[];
  TableType?: TableType[];
  distance?: number | string;
  isRecommended?: boolean;
}

export type TicketStatus = "Waiting" | "Serving" | "Completed" | "Cancelled" | "Skipped";

export interface Ticket {
  id: string;
  name: string;
  email?: string;
  guests: number;
  service?: string;
  shopId?: string;
  placeId?: string;
  bookDate: string;
  bookTime: string;
  status: TicketStatus | string;
  createdAt: string;
  tableType?: string | null;
  queuesAhead?: number;
  estimatedWaitTime?: number;
}

export type ActivityStatus = "Open" | "Closed" | "Completed" | "Cancelled";

export interface Guest {
  userId: string;
  userName: string;
  pax: number;
  status: 'pending' | 'confirmed';
}

export interface LinkedTicket {
  shopId: string;
  shopName: string;
  bookTime: string;
  bookDate: string;
  tableType: string;
  tableCapacity: number;
  hostPax: number;
}

export interface PartyActivity {
  id: string;
  hostId: string;
  name: string;
  activity: string;
  category: string;
  avatar?: string;
  lat: number;
  lng: number;
  linkedTicket?: LinkedTicket;
  status: ActivityStatus | string;
  joinedGuests: Guest[];
  createdAt: string;
  distance?: number | string; // ค่าที่ได้จากการคำนวณในแอปหรือ AI (ไม่ต้องมีใน DB ก็ได้ แต่แอปใช้)
  matchRate?: number;
  isRecommended?: boolean;
  remainingSeats?: number;
}

// 🌟 เพิ่ม Type สำหรับแชท
export interface ChatMessage {
  id: string;
  activityId?: string;
  senderId?: string;
  senderName?: string;
  text: string;
  createdAt?: string;
  type?: 'user' | 'ai'; // ใช้แยกว่าใครพิมพ์ในหน้า AIChat
  placeCard?: any; // ใช้ในหน้า AIChat ตอนส่งการ์ดร้าน
}

export interface SupportTicket {
  id: string;
  userId?: string;
  status: "Open" | "Resolved" | string;
  messages: ChatMessage[];
  createdAt?: string;
}

export interface SettingsState {
  businessName: string;
  phone: string;
  email: string;
  maxQueuePerDay: number;
  autoCancelMins: number;
}