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
    if (!user?.id) return;

    const channelName = `global-user-status-${user.id}`;

    const existingChannels = supabase.getChannels();
    const duplicate = existingChannels.find(c => c.topic === `realtime:${channelName}`);
    if (duplicate) {
      supabase.removeChannel(duplicate);
    }
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'User',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new && payload.new.status) {
            dispatch(updateStatusSuccess(payload.new.status));
          }
        }
      );

    channel.subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [user?.id, dispatch]);

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#6FA4A1", headerShown: false }}>
      <Tabs.Screen name="Home" options={{ title: "Home", tabBarIcon: ({color}) => <Home color={color} /> }} />
      <Tabs.Screen name="SmartFeed" options={{ title: "AI", tabBarIcon: ({color}) => <Sparkles color={color} /> }} />
      <Tabs.Screen name="Queue" options={{ title: "Queue", tabBarIcon: ({color}) => <ClipboardList color={color} /> }} />
      <Tabs.Screen name="Profile" options={{ title: "Profile", tabBarIcon: ({color}) => <User color={color} /> }} />
      <Tabs.Screen name="FindFriends" options={{ href: null }} />
    </Tabs>
  );
}