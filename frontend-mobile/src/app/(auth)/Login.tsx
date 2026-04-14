import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Mail, EyeOff, Eye, Lock } from 'lucide-react-native';
import { useRouter, Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

import { useAppDispatch } from '../../hooks/useRedux';
import { loginSuccess } from '../../redux/slices/authSlice'; 
import { User } from '../../types';

// 🌟 1. นำเข้า Hook Form และ Zod
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// 🌟 2. กำหนด Schema
const loginSchema = z.object({
  emailOrPhone: z.string().min(1, "กรุณากรอกอีเมลหรือเบอร์โทรศัพท์"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน")
});

type LoginFormData = z.infer<typeof loginSchema>;

const mockLoginAPI = async (loginData: LoginFormData): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const existingUsersJson = await AsyncStorage.getItem('mock_users_db');
  
  if (!existingUsersJson) throw new Error('ไม่พบบัญชีผู้ใช้งานในระบบ กรุณาสมัครสมาชิกก่อน');

  const existingUsers = JSON.parse(existingUsersJson) as User[];
  const foundUser = existingUsers.find((u) => u.email === loginData.emailOrPhone || u.phone === loginData.emailOrPhone);
  
  if (!foundUser) throw new Error('ไม่พบบัญชีผู้ใช้งานนี้ในระบบ');
  if ((foundUser as User & { password?: string }).password !== loginData.password) throw new Error('รหัสผ่านไม่ถูกต้อง');

  const { password, ...userWithoutPassword } = foundUser as any;
  return userWithoutPassword as User;
};

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // 🌟 3. ติดตั้ง useForm
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { emailOrPhone: "", password: "" },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setApiError('');
    setIsLoading(true);
    try {
      const userData = await mockLoginAPI(data);
      dispatch(loginSuccess(userData));
    } catch (error: any) {
      setApiError(error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <View style={styles.heroContainer}>
        <Text style={styles.mockLogo}>QBuddy</Text>
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.subtitle}>เข้าสู่ระบบเพื่อจัดการคิวและค้นหาเพื่อน</Text>
      </View>

      {apiError ? <View style={styles.errorBox}><Text style={styles.errorBoxText}>{apiError}</Text></View> : null}

      <View style={styles.fieldContainer}>
        <Controller control={control} name="emailOrPhone" render={({ field: { onChange, value } }) => (
          <View style={{ marginBottom: 16 }}>
            <Input label="Email or Phone" placeholder="อีเมล หรือ เบอร์โทรศัพท์" value={value} onChangeText={onChange} rightIcon={<Mail size={20} color="#64748B" />} inputContainerStyle={errors.emailOrPhone ? styles.errorBorder : undefined} />
            {errors.emailOrPhone && <Text style={styles.errorText}>{errors.emailOrPhone.message}</Text>}
          </View>
        )}/>

        <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
          <View style={{ marginBottom: 8 }}>
            <Input label="Password" placeholder="รหัสผ่านของคุณ" value={value} onChangeText={onChange} secureTextEntry={!showPassword} rightIcon={<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>{showPassword ? <Eye size={20} color="#64748B" /> : <EyeOff size={20} color="#64748B" />}</TouchableOpacity>} inputContainerStyle={errors.password ? styles.errorBorder : undefined} />
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>
        )}/>

        <View style={{ alignItems: 'flex-end', marginBottom: 16 }}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(auth)/ForgotPassword' as Href)}><Text style={styles.forgotText}>Forgot Password?</Text></TouchableOpacity>
        </View>
      </View>

      <Button title={isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"} onPress={handleSubmit(onLoginSubmit)} disabled={isLoading} />
      
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(auth)/Register' as Href)}><Text style={styles.signUpText}>Sign up</Text></TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({ 
  heroContainer: { alignItems: 'center', marginBottom: 40 }, 
  welcomeText: { fontSize: 26, fontWeight: '800', color: '#2D3748', marginBottom: 12 }, 
  mockLogo: { fontSize: 40, fontWeight: '900', color: '#38B2AC', marginBottom: 16 }, 
  subtitle: { fontSize: 14, color: '#718096', textAlign: 'center' }, 
  fieldContainer: { width: '100%' }, 
  errorBorder: { borderColor: '#E53E3E', borderWidth: 1.5 }, 
  errorText: { color: '#E53E3E', fontSize: 12, marginTop: 4 }, 
  errorBox: { backgroundColor: '#FFF5F5', padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FED7D7' },
  errorBoxText: { color: '#C53030', fontSize: 13, textAlign: 'center', fontWeight: '500' },
  forgotText: { fontSize: 13, color: '#6FA4A1', fontWeight: '700' }, 
  footerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 }, 
  footerText: { fontSize: 14, color: '#718096' }, 
  signUpText: { fontSize: 14, fontWeight: '800', color: '#38B2AC' } 
});