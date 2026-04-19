import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Home, Sparkles, ClipboardList, User } from "lucide-react-native";
import { useAppDispatch, useAppSelector } from "../../redux/useRedux";
import { updateStatusSuccess } from "../../redux/slices/authSlice";
import { supabase } from "../../config";

export default function TabsLayout() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: any) => state.auth?.user);

  useEffect(() => {
    // ถ้าไม่มี User (ยังไม่ได้ Login) ไม่ต้องเริ่มดักฟัง
    if (!user?.id) return;

    // เริ่มต้นการดักฟัง Realtime จากตาราง User เฉพาะ ID ของเราเอง
    const channel = supabase
      .channel(`global-user-status-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'User',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          // เมื่อมีการเปลี่ยนแปลงสถานะใน Database ให้ส่งค่าไปอัปเดต Redux ทันที
          if (payload.new && payload.new.status) {
            dispatch(updateStatusSuccess(payload.new.status));
          }
        }
      )
      .subscribe();

    // ลบการเชื่อมต่อเมื่อ Component ถูกถอดออก หรือ User เปลี่ยนแปลง
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, dispatch]);

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#6FA4A1", headerShown: false }}>
      <Tabs.Screen 
        name="Home" 
        options={{ 
          title: "Home", 
          tabBarIcon: ({color}) => <Home color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="SmartFeed" 
        options={{ 
          title: "AI", 
          tabBarIcon: ({color}) => <Sparkles color={color} /> 
        }} 
      />
      
      <Tabs.Screen 
        name="Queue" 
        options={{ 
          title: "Queue", 
          tabBarIcon: ({color}) => <ClipboardList color={color} /> 
        }} 
      />
      
      <Tabs.Screen 
        name="Profile" 
        options={{ 
          title: "Profile", 
          tabBarIcon: ({color}) => <User color={color} /> 
        }} 
      />

      <Tabs.Screen name="FindFriends" options={{ href: null }} />
    </Tabs>
  );
}