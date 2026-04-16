import React from "react";

// ... (Type เดิมที่มีอยู่แล้ว เช่น User, Place, Ticket) ...

// 🌟 สิ่งที่เพิ่มเข้ามาใหม่: Unified Type สำหรับระบบ Party / หาเพื่อน
export interface Guest {
  userId: string;
  userName: string;
  pax: number;
  status: "pending" | "confirmed";
}

export type ActivityStatus = "Open" | "Closed" | "Completed" | "Cancelled";

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