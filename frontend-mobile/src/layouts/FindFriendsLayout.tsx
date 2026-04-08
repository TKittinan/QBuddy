// src/layouts/FindFriendsLayout.tsx
import React, { ReactNode } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface FindFriendsLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

// เปลี่ยนชื่อ Component ตรงนี้ให้ตรงกับที่ import
export const FindFriendsLayout = ({ children, title, subtitle }: FindFriendsLayoutProps) => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#F7FAFC]">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header Section */}
        <View className="px-5 pt-4 pb-2 bg-[#6FA4A1] rounded-b-3xl shadow-sm z-10">
          <View className="flex-row items-center mb-2">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-white">{title}</Text>
              {subtitle && <Text className="text-xs text-white opacity-80 mt-0.5">{subtitle}</Text>}
            </View>
          </View>
        </View>

        {/* Content Section */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};