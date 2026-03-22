// AuthProvider.tsx

import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./auth.context";
import type { User } from "./auth.type";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูล User จากเครื่องขึ้นมาเมื่อเปิดแอปครั้งแรก
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user_session");
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to load user session", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // ฟังก์ชันเข้าสู่ระบบ
  const login = async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem("user_session", JSON.stringify(userData));
  };

  // ฟังก์ชันอัปเดตสถานะ User (เช่น อัปเดต ai_consented เป็น true หลังกดยอมรับ)
  const updateUserStatus = async (newStatus: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...newStatus };
      setUser(updatedUser);
      await AsyncStorage.setItem("user_session", JSON.stringify(updatedUser));
    }
  };

  // ฟังก์ชันออกจากระบบ
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("user_session");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, updateUserStatus, logout }}>
      {children}
    </AuthContext.Provider>
  );
}