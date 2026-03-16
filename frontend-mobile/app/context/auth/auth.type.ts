export interface User {
  id: string;
  name: string;
  role: "admin" | "staff" | "user";
  email: string;
}

export interface AuthContextType {
  user: User | null;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
}