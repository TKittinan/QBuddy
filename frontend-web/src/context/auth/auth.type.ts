export interface User {
  id: string;
  name: string;
  role: "ADMIN" | "STAFF";
  email: string;
}

export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}