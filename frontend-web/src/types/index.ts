import React from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ONLINE" | "OFFLINE" | "UNVERIFIED";
  createdAt: string;
}

export type Column<T> = {
  header: string;
  key: keyof T | string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};