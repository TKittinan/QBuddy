export interface User {
  id: string;
  name: string;
  role: "admin" | "staff" | "user";
  email: string;
  phone: string;
  ai_consented: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => Promise<void>;
  updateUserStatus: (newStatus: Partial<User>) => Promise<void>; // ฟังก์ชันอัปเดตสถานะ User
  logout: () => Promise<void>;
}