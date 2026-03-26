import { Stack } from "expo-router";
import { AuthProvider } from "../app/context/auth/AuthProvider";
import "./global.css";
export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="pages/Login" />
      </Stack>
    </AuthProvider>
  );
}