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
}

export interface TableType {
  id: string;
  label: string;
  capacity: number;
}

export interface Place {
  id: string;
  placeId: string;
  name: string;
  branch: string;
  category: string;
  description?: string;
  tags: string[];
  image: string;
  logoUrl: string;
  avgServiceTime: number;
  openTime: string;
  closeTime: string;
  lat: number;
  lng: number;
  monthlyBookings: number;
  tableTypes?: TableType[];
}

export type TicketStatus = "Waiting" | "Serving" | "Completed" | "Cancelled";

export interface Ticket {
  id: string;
  name: string;
  guests: number;
  service?: string;
  shopId: string;
  bookDate: string;
  bookTime: string;
  status: TicketStatus | string;
  createdAt: string;
  tableType?: string | null;
}

export type ActivityStatus = "Open" | "Closed" | "Completed" | "Cancelled";

export interface Guest {
  userId: string;
  userName: string;
  pax: number;
  status: 'pending' | 'confirmed';
}

export interface PartyActivity {
  id: string;
  bookingId?: string;
  hostId: string;
  hostName: string;
  hostPhone?: string;
  avatarUrl?: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  placeId: string;
  placeName: string;
  meetingDate: string;
  meetingTime: string;
  lat: number;
  lng: number;
  joinedGuests: Guest[];
  maxGuests: number;
  status: ActivityStatus;
  createdAt: string;
}