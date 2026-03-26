// app/layout/AuthLayout.tsx

import React, { ReactNode } from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthLayoutProps {
  children: ReactNode;
}

// สร้างฟังก์ชันเช็คข้อมูลซ้ำไว้ที่ระดับ Layout
export const UserRegCheck = async (fullName: string, email: string, phone: string) => {
  const existingUsersJson = await AsyncStorage.getItem('mock_users_db');
  const existingUsers = existingUsersJson ? JSON.parse(existingUsersJson) : [];

  return {
    isNameTaken: existingUsers.some((u: any) => u.fullName === fullName),
    isEmailTaken: existingUsers.some((u: any) => u.email === email),
    isPhoneTaken: existingUsers.some((u: any) => u.phone === phone),
  };
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EEF2F4' }, 
  container: { flex: 1 },
  scrollContent: { 
    flexGrow: 1, 
    paddingHorizontal: 24, 
    paddingTop: 40, 
    paddingBottom: 40, 
    justifyContent: 'center' 
  },
});