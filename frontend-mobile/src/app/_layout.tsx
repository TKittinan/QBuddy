import { Stack, useRouter, useSegments, Href } from "expo-router";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import * as Location from 'expo-location';

import { store } from "../redux";
import { useAppSelector } from "../hooks/useRedux";
import "./global.css";

const RootNavigation = () => {
  const { user } = useAppSelector((state) => state.auth);
  const segments = useSegments();
  const router = useRouter();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
    
    const requestAppPermissions = async () => {
      try {
        await Location.requestForegroundPermissionsAsync();
      } catch (error) {
        console.error("Permission request error at app launch:", error);
      }
    };

    requestAppPermissions();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const firstSegment = segments[0] as string | undefined;
    const secondSegment = segments[1] as string | undefined;
    const inAuthGroup = firstSegment === '(auth)';

    const routingTimer = setTimeout(() => {
      if (!user && !inAuthGroup) {
        router.replace('/(auth)/Login' as Href);
      } else if (user && !user.ai_consented && secondSegment !== 'AIConsent') {
        router.replace('/(auth)/AIConsent' as Href);
      } else if (user && user.ai_consented && inAuthGroup) {
        router.replace('/(tabs)/Home' as Href); 
      }
    }, 10);
    return () => clearTimeout(routingTimer);

  }, [user, segments, isReady]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootNavigation />
    </Provider>
  );
}