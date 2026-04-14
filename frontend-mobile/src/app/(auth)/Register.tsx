import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ArrowLeft, EyeOff, Eye, CheckCircle2, XCircle } from 'lucide-react-native';
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

// 🌟 2. กำหนด Schema (ใช้ superRefine เช็ครหัสผ่านให้ตรงกัน)
const registerSchema = z.object({
  fullName: z.string().min(1, "กรุณากรอกชื่อ-นามสกุล"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  phone: z.string().min(10, "เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก"),
  password: z.string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    .regex(/[A-Z]/, "ต้องมีตัวอักษรพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว")
    .regex(/[a-z]/, "ต้องมีตัวอักษรพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว"),
  confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน")
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "รหัสผ่านไม่ตรงกัน",
      path: ["confirmPassword"]
    });
  }
});

type RegisterFormData = z.infer<typeof registerSchema>;

const mockRegisterAPI = async (userData: RegisterFormData): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const existingUsersJson = await AsyncStorage.getItem('mock_users_db');
  const existingUsers = existingUsersJson ? (JSON.parse(existingUsersJson) as Array<User & { password?: string }>) : [];
  
  if (existingUsers.some(u => u.email === userData.email)) throw new Error('อีเมลนี้ถูกใช้งานแล้วในระบบ');
  
  const newUser: User & { password?: string } = { id: `usr_${Date.now()}`, name: userData.fullName, email: userData.email, phone: userData.phone, password: userData.password, ai_consented: false, role: 'user' };
  existingUsers.push(newUser);
  await AsyncStorage.setItem('mock_users_db', JSON.stringify(existingUsers));
  
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // 🌟 3. ติดตั้ง useForm
  const { control, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
    mode: "onChange"
  });

  const passwordValue = watch("password");

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setApiError('');
    setIsLoading(true);
    try {
      await mockRegisterAPI(data);
      Alert.alert('สำเร็จ', 'สมัครสมาชิกเรียบร้อยแล้ว', [{ text: 'ไปหน้าเข้าสู่ระบบ', onPress: () => router.replace('/(auth)/Login' as Href) }]);
    } catch (error: any) {
      setApiError(error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
    } finally {
      setIsLoading(false);
    }
  };

  const renderReqItem = (isMet: boolean, text: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
      {isMet ? <CheckCircle2 size={14} color="#48BB78" /> : <XCircle size={14} color="#A0AEC0" />}
      <Text style={{ fontSize: 12, color: isMet ? '#48BB78' : '#718096', marginLeft: 8 }}>{text}</Text>
    </View>
  );

  return (
    <AuthLayout>
      <View style={styles.fullScreenContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><ArrowLeft size={24} color="#2D3748" /></TouchableOpacity>
          <Text style={styles.headerTitle}>สร้างบัญชีใหม่</Text>
        </View>

        {apiError ? <View style={styles.errorBox}><Text style={styles.errorBoxText}>{apiError}</Text></View> : null}

        <View style={{ flex: 1, marginTop: 10 }}>
          <Controller control={control} name="fullName" render={({ field: { onChange, value } }) => (
            <View style={styles.fieldContainer}><Input label="Full Name" placeholder="ชื่อ-นามสกุล" value={value} onChangeText={onChange} inputContainerStyle={errors.fullName ? styles.errorBorder : undefined} />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName.message}</Text>}</View>
          )}/>

          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
            <View style={styles.fieldContainer}><Input label="Email Address" placeholder="example@email.com" value={value} onChangeText={onChange} keyboardType="email-address" inputContainerStyle={errors.email ? styles.errorBorder : undefined} />
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}</View>
          )}/>

          <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
            <View style={styles.fieldContainer}><Input label="Phone Number" placeholder="08x-xxx-xxxx" value={value} onChangeText={(text) => onChange(text.replace(/[^0-9]/g, '').slice(0, 10))} keyboardType="phone-pad" inputContainerStyle={errors.phone ? styles.errorBorder : undefined} />
            {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}</View>
          )}/>

          <View style={styles.passwordGroupContainer}>
            <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
              <View style={styles.fieldContainer}><Input label="Password" placeholder="ตั้งรหัสผ่าน" value={value} onChangeText={onChange} secureTextEntry={!showPassword} rightIcon={<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>{showPassword ? <Eye size={20} color="#64748B" /> : <EyeOff size={20} color="#64748B" />}</TouchableOpacity>} inputContainerStyle={errors.password ? styles.errorBorder : undefined} />
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}</View>
            )}/>

            <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => (
              <View style={styles.fieldContainer}><Input label="Confirm Password" placeholder="ยืนยันรหัสผ่านอีกครั้ง" value={value} onChangeText={onChange} secureTextEntry={!showConfirmPassword} rightIcon={<TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <Eye size={20} color="#64748B" /> : <EyeOff size={20} color="#64748B" />}</TouchableOpacity>} inputContainerStyle={errors.confirmPassword ? styles.errorBorder : undefined} />
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}</View>
            )}/>

            <View style={{ backgroundColor: '#F7FAFC', padding: 12, borderRadius: 12, marginTop: 4 }}>
              {renderReqItem(passwordValue.length >= 8, 'อย่างน้อย 8 ตัวอักษร')}
              {renderReqItem(/[A-Z]/.test(passwordValue), 'มีตัวอักษรพิมพ์ใหญ่ (A-Z)')}
              {renderReqItem(/[a-z]/.test(passwordValue), 'มีตัวอักษรพิมพ์เล็ก (a-z)')}
            </View>
          </View>

          <Button title={isLoading ? "กำลังสมัคร..." : "สมัครสมาชิก"} onPress={handleSubmit(onRegisterSubmit)} disabled={isLoading} style={{ marginTop: 10 }} />
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({ 
  fullScreenContainer: { flex: 1 }, 
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative' }, 
  backButton: { position: 'absolute', left: 0 }, 
  headerTitle: { fontSize: 18, fontWeight: '700' }, 
  fieldContainer: { marginBottom: 16 }, 
  passwordGroupContainer: { marginBottom: 24 },
  errorBorder: { borderColor: '#E53E3E', borderWidth: 1.5 }, 
  errorText: { color: '#E53E3E', fontSize: 12, marginTop: 4 }, 
  errorBox: { backgroundColor: '#FFF5F5', padding: 12, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FED7D7' },
  errorBoxText: { color: '#C53030', fontSize: 13, textAlign: 'center', fontWeight: '500' }
});