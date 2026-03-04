export interface User {
  id: string;
  name: string;
  role: "admin" | "staff";
  email: string;
}

export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}