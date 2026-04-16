import React from "react";

export type RoleType = "ADMIN" | "STAFF" | "CUSTOMER";
export type TicketStatus = "Waiting" | "Serving" | "Completed" | "Skipped" | "Cancelled";
export type PlaceStatus = "Active" | "Inactive"; // 🌟 ลบ Disabled ออกแล้ว
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

export type Column<T> = {
  header: string;
  key: keyof T | string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};