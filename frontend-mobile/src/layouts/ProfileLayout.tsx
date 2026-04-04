// src/layouts/ProfileLayout.tsx
import React, { ReactNode } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Navigation } from '../components/ui/Navigation';

interface ProfileLayoutProps {
  children: ReactNode;
  onEditPress: () => void;
}

export const ProfileLayout = ({ children, onEditPress }: ProfileLayoutProps) => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F7FAFC]">
      {/* 🔝 Header Section */}
      <View className={`px-5 py-4 flex-row items-center justify-between bg-white shadow-sm z-10 ${Platform.OS === 'android' ? 'pt-10' : ''}`}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Profile & Settings</Text>
        <TouchableOpacity onPress={onEditPress}>
          <Text className="text-base font-bold text-[#6FA4A1]">Edit</Text>
        </TouchableOpacity>
      </View>

      {/* 📄 Content Section */}
      <View className="flex-1">
        {children}
      </View>

      {/* ⬇️ Bottom Navigation Bar */}
      <Navigation activeTab="profile" />
    </SafeAreaView>
  );
};