import React from "react";

export type RoleType = "ADMIN" | "STAFF" | "CUSTOMER";
export type TicketStatus = "Waiting" | "Serving" | "Completed" | "Skipped" | "Cancelled";
export type PlaceStatus = "Active" | "Disabled" | "Inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatarUrl?: string;
  role: RoleType;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ONLINE" | "OFFLINE" | "UNVERIFIED";
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

export type Column<T> = {
  header: string;
  key: keyof T | string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};