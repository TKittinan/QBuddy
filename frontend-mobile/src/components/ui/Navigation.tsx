// src/components/ui/Navigation.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Home, Sparkles, Calendar, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// กำหนดประเภทของ Tab ทั้งหมดที่มี
type TabType = 'home' | 'discover' | 'queue' | 'profile';

interface NavigationProps {
  activeTab: TabType;
}

export const Navigation = ({ activeTab }: NavigationProps) => {
  const router = useRouter();

  // สร้าง Array เก็บข้อมูลของแต่ละ Tab เพื่อเอาไปวนลูป (Map) สร้างปุ่ม
  const tabs = [
    { id: 'home', label: 'Home', icon: Home, route: '/pages/Home' },
    { id: 'discover', label: 'AI / Discover', icon: Sparkles, route: '/pages/SmartFeed' },
    { id: 'queue', label: 'Queue', icon: Calendar, route: '/pages/Queue' }, // สร้างเผื่ออนาคต
    { id: 'profile', label: 'Profile', icon: User, route: '/pages/Profile' }, // สร้างเผื่ออนาคต
  ];

  return (
    <View className="flex-row h-[70px] bg-white border-t border-gray-200 pb-2 justify-around items-center">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id; // เช็คว่า Tab นี้กำลังถูกเลือกอยู่หรือไม่
        
        return (
          <TouchableOpacity 
            key={tab.id}
            // ปรับปรุง 1: ลบ w-16 ออกเพื่อให้พื้นที่ยืดหยุ่นได้ และเพิ่ม padding แนวนอนเล็กน้อย
            className="items-center justify-center px-1"
            onPress={() => router.push(tab.route as any)}
          >
            <Icon size={24} color={isActive ? '#6FA4A1' : '#A0AEC0'} />
            
            {/* 🛡️ ปรับปรุง 2: เพิ่มขนาดตัวอักษร (text-[11px]) และเพิ่มระยะห่างจากไอคอน (mt-1.5)
                 🛡️ ปรับปรุง 3: ปรับสีตัวอักษรที่ไม่ได้เลือกให้เข้มขึ้น (text-gray-500) เพื่อให้อ่านง่ายและสวยงามขึ้น */}
            <Text className={`text-[11px] mt-1.5 font-semibold ${isActive ? 'text-[#6FA4A1]' : 'text-gray-500'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};