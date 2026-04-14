import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { useRouter, Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { User } from '../../types';

// 🌟 1. นำเข้า Hook Form และ Zod
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const forgotSchema = z.object({
  email: z.string().min(1, "กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง")
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 🌟 2. ติดตั้ง useForm
  const { control, handleSubmit, formState: { errors }, setError } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" }
  });

  const onResetSubmit = async (data: ForgotFormData) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const existingUsersJson = await AsyncStorage.getItem('mock_users_db');
      const existingUsers = existingUsersJson ? (JSON.parse(existingUsersJson) as User[]) : [];

      const foundUser = existingUsers.find(u => u.email === data.email);
      if (!foundUser) {
        // ใช้ setError ของ useForm ดัน Error เข้าไปที่ช่อง email ตรงๆ เลย
        setError("email", { type: "manual", message: "ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีกครั้ง" });
        return;
      }

      Alert.alert('ส่งลิงก์สำเร็จ', `ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ ${data.email} แล้ว`, [{ text: 'กลับไปหน้าเข้าสู่ระบบ', onPress: () => router.replace('/(auth)/Login' as Href) }]);
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถดำเนินการได้ในขณะนี้');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.fullScreenContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><ArrowLeft size={24} color="#2D3748" /></TouchableOpacity>
          <Text style={styles.headerTitle}>ลืมรหัสผ่าน</Text>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.description}>กรุณากรอกอีเมลที่คุณใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปให้ทางอีเมล</Text>

          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <View style={styles.fieldContainer}>
              <Input label="Email Address" placeholder="example@email.com" value={value} onChangeText={onChange} keyboardType="email-address" rightIcon={<Mail size={20} color="#64748B" />} inputContainerStyle={errors.email ? styles.errorBorder : undefined} />
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
            </View>
          )}/>

          <Button title={isLoading ? "กำลังส่งลิงก์..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"} onPress={handleSubmit(onResetSubmit)} disabled={isLoading} style={styles.submitBtn} />
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
  description: { fontSize: 14, color: '#718096', lineHeight: 22, marginBottom: 30, textAlign: 'center', paddingHorizontal: 10 },
  fieldContainer: { marginBottom: 30 },
  errorBorder: { borderColor: '#E53E3E', borderWidth: 1.5 },
  errorText: { color: '#E53E3E', fontSize: 12, marginTop: 4 },
  submitBtn: { marginTop: 10 }
});