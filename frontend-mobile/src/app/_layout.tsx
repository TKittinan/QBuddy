import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { AuthProvider } from "../context/auth/AuthProvider";
import { useAuth } from "../context/auth/use.Auth";
import "./global.css";

// แยก Component เพื่อให้สามารถเรียกใช้ useAuth() และ Hook ของ Router ได้
const RootNavigation = () => {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // ถ้าระบบกำลังดึงข้อมูลจาก AsyncStorage ให้รอไปก่อน
    if (isLoading) return; 

    // เช็คว่าตอนนี้ผู้ใช้อยู่ในกลุ่มหน้าจอ Auth หรือไม่ (Login หรือ Register)
    const inAuthGroup = segments[0] === 'pages' && (segments[1] === 'Login' || segments[1] === 'Register');

    if (!user && !inAuthGroup) {
      // เงื่อนไข 1: ยังไม่ล็อกอิน -> บังคับดีดไปหน้า Login
      router.replace('/pages/Login');
    } else if (user && !user.ai_consented && segments[1] !== 'AIConsent') {
      // เงื่อนไข 2: ล็อกอินแล้ว แต่ยังไม่กดยอมรับ AI -> บังคับดีดไปหน้า Consent
      router.replace('/pages/AIConsent');
    } else if (user && user.ai_consented && inAuthGroup) {
      // เงื่อนไข 3: ล็อกอินและยอมรับ AI แล้ว แต่ดันกลับมาหน้า Login/Register -> ดีดไปหน้า Home
      router.replace('/pages/Home');
    }
  }, [user, isLoading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="pages/Login" />
      <Stack.Screen name="pages/Register" />
      <Stack.Screen name="pages/AIConsent" />
      <Stack.Screen name="pages/Home" />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}