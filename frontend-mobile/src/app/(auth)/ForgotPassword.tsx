import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { useRouter, Href } from 'expo-router';
import { Platform } from 'react-native';

import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

// นำเข้า Redux hooks และ async thunk ที่สร้างไว้
import { useAppDispatch } from '../../redux/useRedux';
import { forgotPasswordAsync } from '../../redux/slices/authSlice';

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";


const forgotSchema = z.object({
  email: z.string().min(1, "กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง")
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors }, setError } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" }
  });

  // อย่าลืม import Platform เพิ่มด้านบนนะ: import { Platform, Alert, ... } from 'react-native';

const onResetSubmit = async (data: ForgotFormData) => {
  setIsLoading(true);
  console.log(" เริ่มส่ง API ด้วยอีเมล:", data.email); // 1. เช็คว่าปุ่มกดติดไหม

  try {
    const resultAction = await dispatch(forgotPasswordAsync(data.email));
    console.log(" ผลลัพธ์จาก Redux:", resultAction); // 2. ดูว่า Backend ตอบอะไรกลับมา!

    if (forgotPasswordAsync.fulfilled.match(resultAction)) {
      console.log(" ส่งเมลสำเร็จ!");
      
      // ปรับปรุง Alert ให้รองรับทั้งเว็บและมือถือ
      if (Platform.OS === 'web') {
        window.alert(`ส่งลิงก์สำเร็จ! กรุณาเช็คอีเมล ${data.email}`);
        router.replace('/(auth)/Login' as Href);
      } else {
        Alert.alert(
          'ส่งลิงก์สำเร็จ', 
          `ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ ${data.email} แล้ว`, 
          [{ text: 'ตกลง', onPress: () => router.replace('/(auth)/Login' as Href) }]
        );
      }
    } else {
      const errorMessage = resultAction.payload as string;
      console.error(" Backend ตอบกลับมาว่ามี Error:", errorMessage); // ดู Error ว่าคืออะไร
      setError("email", { 
        type: "manual", 
        message: errorMessage || "ไม่พบอีเมลนี้ในระบบ หรือเซิร์ฟเวอร์มีปัญหา" 
      });
    }
  } catch (error) {
    console.error(" ระบบพัง (Catch):", error);
    window.alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ในขณะนี้');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <AuthLayout>
      <View style={styles.fullScreenContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ลืมรหัสผ่าน</Text>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.description}>
            กรุณากรอกอีเมลที่คุณใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปให้ทางอีเมล
          </Text>

          <Controller 
            control={control} 
            name="email" 
            render={({ field: { onChange, value } }) => (
              <View style={styles.fieldContainer}>
                <Input 
                  label="Email Address" 
                  placeholder="example@email.com" 
                  value={value} 
                  onChangeText={onChange} 
                  keyboardType="email-address" 
                  rightIcon={<Mail size={20} color="#64748B" />} 
                  inputContainerStyle={errors.email ? styles.errorBorder : undefined} 
                />
                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
              </View>
            )}
          />

          <Button 
            title={isLoading ? "กำลังส่งลิงก์..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"} 
            onPress={handleSubmit(onResetSubmit)} 
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
  description: { fontSize: 14, color: '#718096', lineHeight: 22, marginBottom: 30, textAlign: 'center', paddingHorizontal: 10 },
  fieldContainer: { marginBottom: 30 },
  errorBorder: { borderColor: '#E53E3E', borderWidth: 1.5 },
  errorText: { color: '#E53E3E', fontSize: 12, marginTop: 4 },
  submitBtn: { marginTop: 10 }
});