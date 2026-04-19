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
  weeklyBookings?: number;
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
  tableCount?: number;
}

export type ActivityStatus = "Open" | "Closed" | "Completed" | "Cancelled";

export interface Guest {
  userId: string;
  userName?: string;
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

  title?: string;
  description?: string;
  category: string;
  tags?: string[];
  meetingDate?: string;
  meetingTime?: string;
  lat: number;
  lng: number;
  maxGuests?: number;
  status: ActivityStatus | string;
  hostId: string;
  placeId?: string;
  createdAt: string;
  bookingId?: string | null;
  host?: {
    id?: string;
    name: string;
    avatarUrl?: string;
    interests?: string[];
    successRate?: number;
  };
  place?: {
    name: string;
    branch?: string | null;
  };
  joinedGuests: Guest[];

  distance?: number | string;
  matchRate?: number;
  isRecommended?: boolean;
  remainingSeats?: number;
  sharedInterests?: number;

  name?: string;
  activity?: string;
  avatar?: string;
  linkedTicket?: LinkedTicket;
}

export interface ChatMessage {
  id: string;
  activityId?: string;
  senderId?: string;
  senderName?: string;
  text: string;
  createdAt?: string;
  type?: 'user' | 'ai';
  placeCard?: any;
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