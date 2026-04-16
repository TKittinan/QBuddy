export interface User {
  id: string;
  name: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER"; 
  email: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}