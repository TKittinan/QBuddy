export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  ai_consented: boolean;
}

export interface Place {
  id: string;
  placeId: string;
  name: string;
  categories: string[];
  status: "Active" | "Inactive";
  avgServiceTime: number;
}

export interface Ticket {
  id: string;
  name: string;
  service: string;
  shopId: string;
  waitTime: number;
  status: "Waiting" | "Serving" | "Completed" | "Skipped" | "Cancelled";
  createdAt: string;
}