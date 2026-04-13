import { Tabs } from "expo-router";
import { Home, Sparkles, ClipboardList, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#6FA4A1", headerShown: false }}>
      <Tabs.Screen name="Home" options={{ title: "Home", tabBarIcon: ({color}) => <Home color={color} /> }} />
      <Tabs.Screen name="SmartFeed" options={{ title: "AI", tabBarIcon: ({color}) => <Sparkles color={color} /> }} />
      
      <Tabs.Screen 
        name="Queue" 
        options={{ 
          title: "Queue", 
          tabBarIcon: ({color}) => <ClipboardList color={color} /> 
        }} 
      />
      
      <Tabs.Screen name="Profile" options={{ title: "Profile", tabBarIcon: ({color}) => <User color={color} /> }} />

      <Tabs.Screen name="FindFriends" options={{ href: null }} />
    </Tabs>
  );
}