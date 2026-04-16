import React from "react";

export type RoleType = "ADMIN" | "STAFF" | "CUSTOMER";
export type TicketStatus = "Waiting" | "Serving" | "Completed" | "Skipped" | "Cancelled";
export type PlaceStatus = "Active" | "Inactive"; 
export type ActivityStatus = "Open" | "Closed" | "Completed" | "Cancelled";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatarUrl?: string;
  role: RoleType;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ONLINE" | "OFFLINE" | "UNVERIFIED";
  ai_consented?: boolean;
  createdAt: string;
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
  tags: string[];
  status: PlaceStatus;
  description?: string;
  address?: string;
  phone?: string;
  lat: number;
  lng: number;
  openTime: string;
  closeTime: string;
  avgServiceTime: number;
  queueCount: number;
  image?: string;
  logoUrl?: string;
  coverUrl?: string;
  isRecommended?: boolean;
  monthlyBookings?: number;
  tableTypes?: TableType[];
  createdAt?: string;
}

// 🌟 Ticket ของระบบคิวและจอง
export interface Ticket {
  id: string;
  shopId: string;
  name: string;
  service: string;
  guests: number;
  bookDate?: string; 
  bookTime?: string;
  tableType?: string | null;
  waitTime?: number;
  status: TicketStatus;
  createdAt: string;
}

export interface Guest {
  userId: string;
  userName: string;
  pax: number;
  status: "pending" | "confirmed";
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
  distance?: string;
  successRate?: number;
  sharedInterests?: number; 
  joinedGuests: Guest[];
  maxGuests: number;
  status: ActivityStatus;
  createdAt: string;
}

// 🌟 Type ใหม่สำหรับ Inbox (Support)
export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
};

// เปลี่ยนชื่อเป็น SupportTicket เพื่อไม่ให้ซ้ำกับ Ticket ด้านบน
export type SupportTicket = {
  id: string;
  userName: string;
  subject: string;
  category: "Bug" | "Shop Issue" | "General";
  status: "Pending" | "Resolved";
  createdAt: string;
  messages: Message[];
};

// 🌟 Type ใหม่สำหรับหน้า Settings
export type SettingsState = {
  businessName: string;
  phone: string;
  email: string;
  maxQueuePerDay: string;
  autoCancelMins: string;
};

export type Column<T> = {
  header: string;
  key: keyof T | string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};