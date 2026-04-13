import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { useRouter, Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { User } from '../../types';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleResetPassword = async () => {
    setEmailError('');
    if (!email) {
      setEmailError('กรุณากรอกอีเมลที่ใช้สมัครสมาชิก');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const existingUsersJson = await AsyncStorage.getItem('mock_users_db');
      const existingUsers = existingUsersJson ? (JSON.parse(existingUsersJson) as User[]) : [];

      const foundUser = existingUsers.find(u => u.email === email);
      if (!foundUser) {
        throw new Error('ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีกครั้ง');
      }

      Alert.alert(
        'ส่งอีเมลสำเร็จ',
        'เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ',
        [{ text: 'กลับไปหน้าเข้าสู่ระบบ', onPress: () => router.replace('/(auth)/Login' as Href) }]
      );
    } catch (error) {
      setEmailError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* 🌟 ใส่ flex: 1 เพื่อให้มันกางเต็มจอเหมือน Login */}
      <View style={styles.fullScreenContainer}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Forgot Password</Text>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.description}>
            กรุณากรอกอีเมลที่คุณใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับตั้งค่ารหัสผ่านใหม่ไปให้คุณทางอีเมล
          </Text>

          <View style={styles.fieldContainer}>
            <Input
              label="Email Address"
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              rightIcon={<Mail size={20} color="#64748B" />}
              inputContainerStyle={emailError ? styles.errorBorder : undefined}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <Button
            title={isLoading ? "กำลังส่งลิงก์..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
            onPress={handleResetPassword}
            disabled={isLoading}
            style={styles.submitBtn}
          />
        </View>

      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30, position: 'relative' },
  backButton: { position: 'absolute', left: 0 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#2D3748' },
  contentContainer: { marginTop: 10, flex: 1 },
  description: { fontSize: 14, color: '#718096', marginBottom: 24, lineHeight: 22 },
  fieldContainer: { marginBottom: 24 },
  errorBorder: { borderColor: '#E53E3E', borderWidth: 1.5 },
  errorText: { color: '#E53E3E', fontSize: 12, marginTop: 4 },
  submitBtn: { marginTop: 8 }
});