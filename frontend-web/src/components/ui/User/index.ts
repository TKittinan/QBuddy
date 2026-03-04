// src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface Queue {
  id: string;
  ticket: string;
  name: string;
  service: string;
  wait: number;
  status: "WAITING" | "CALLED" | "DONE";
}

export type Column<T> = {
  header: string;
  key: keyof T | string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};