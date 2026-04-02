// src/layouts/SmartFeedLayout.tsx
import React, { ReactNode } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Sparkles, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// 🚨 1. Import ตัว BottomNav
    import { Navigation } from '../components/ui/Navigation';

interface SmartFeedLayoutProps {
  children: ReactNode;
}

export const SmartFeedLayout = ({ children }: SmartFeedLayoutProps) => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F7FAFC]">
      {/* 🔝 Header Section */}
      <View className={`px-5 py-4 flex-row items-center justify-between bg-white shadow-sm z-10 ${Platform.OS === 'android' ? 'pt-10' : ''}`}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Smart Feed</Text>
        <TouchableOpacity>
          <Sparkles size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* 📄 Content Section */}
      <View className="flex-1">
        {children}
      </View>

      {/* 🚨 2. เรียกใช้ Component และบอกว่าหน้านี้คือแท็บ discover */}
      <Navigation activeTab="discover" />

    </SafeAreaView>
  );
};