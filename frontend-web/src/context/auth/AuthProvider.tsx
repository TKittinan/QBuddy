import { useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./auth.context";
import type { User } from "./auth.type";
import axios from "axios";

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // เพิ่ม State สำหรับเก็บ Token (JWT)
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("access_token") || null;
  });

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access_token", authToken);
  };

  const logout = async () => {
  try {
    // ใส่ ID ของ user คนปัจจุบันที่กำลังจะ logout ออกไป
    if (user?.id) {
      await axios.post("http://localhost:3000/api/auth/logout", { 
        adminId: user.id 
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // ไม่ว่าจะยิง API สำเร็จหรือไม่ ก็ต้องล้างค่าในเครื่องเพื่อเตะออกไปหน้า Login
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
  }
};

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}