export interface User {
  id: string;
  name: string;
  role: "ADMIN" | "STAFF"; // 🌟 ปรับเป็นตัวพิมพ์ใหญ่ให้ตรงกับระบบ Staff Management
  email: string;
}

export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}