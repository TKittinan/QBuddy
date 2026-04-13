import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Mail, EyeOff, Eye } from 'lucide-react-native';
import { useRouter, Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

import { useAppDispatch } from '../../hooks/useRedux';
import { loginSuccess } from '../../redux/slices/authSlice'; 
import { User } from '../../types';

interface LoginData { emailOrPhone: string; password?: string; }

const mockLoginAPI = async (loginData: LoginData): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const existingUsersJson = await AsyncStorage.getItem('mock_users_db');
  
  if (!existingUsersJson) throw new Error('ไม่พบบัญชีผู้ใช้งานในระบบ กรุณาสมัครสมาชิกก่อน');

  const existingUsers = JSON.parse(existingUsersJson) as User[];
  const foundUser = existingUsers.find((u) => u.email === loginData.emailOrPhone || u.phone === loginData.emailOrPhone);
  
  if (!foundUser) throw new Error('ไม่พบบัญชีผู้ใช้งานนี้ในระบบ');
  if ((foundUser as User & { password?: string }).password !== loginData.password) throw new Error('รหัสผ่านไม่ถูกต้อง');
  
  return foundUser; 
};

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
    setEmailError(''); setPasswordError('');
    if (!emailOrPhone || !password) {
      if (!emailOrPhone) setEmailError('กรุณากรอกอีเมลหรือเบอร์โทรศัพท์');
      if (!password) setPasswordError('กรุณากรอกรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    try {
      const user = await mockLoginAPI({ emailOrPhone, password });
      dispatch(loginSuccess({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, ai_consented: user.ai_consented }));
    } catch (error) {
      const err = error as Error;
      Alert.alert('การเข้าสู่ระบบไม่สำเร็จ', err.message);
      if (err.message.includes('บัญชี')) setEmailError(err.message);
      else if (err.message.includes('รหัสผ่าน')) setPasswordError(err.message);
    } finally { setIsLoading(false); }
  };

  return (
    <AuthLayout>
      <View style={styles.heroContainer}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.mockLogo}>QBuddy</Text> 
        <Text style={styles.subtitle}>Login to manage your queue and discover more.</Text>
      </View>
      <View style={styles.fieldContainer}>
        <Input label="Email or Phone" placeholder="Email or Phone" value={emailOrPhone} onChangeText={setEmailOrPhone} rightIcon={<Mail size={20} color="#64748B" />} inputContainerStyle={emailError ? styles.errorBorder : undefined} />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>
      <View style={styles.fieldContainer}>
        <Input 
          label="Password" 
          placeholder="Password" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry={!showPassword} 
          rightIcon={showPassword ? <Eye size={20} color="#64748B" /> : <EyeOff size={20} color="#64748B" />} 
          onRightIconPress={() => setShowPassword(!showPassword)} 
          inputContainerStyle={passwordError ? styles.errorBorder : undefined} 
          rightTopElement={
            // 🌟 แก้ไข: กดปุ่ม Forgot แล้ววิ่งไปหน้า ForgotPassword
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(auth)/ForgotPassword' as Href)}>
              <Text style={styles.forgotText}>Forgot?</Text>
            </TouchableOpacity>
          } 
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      </View>
      <Button title={isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"} onPress={handleLogin} disabled={isLoading} />
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(auth)/Register' as Href)}>
          <Text style={styles.signUpText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({ heroContainer: { alignItems: 'center', marginBottom: 40 }, welcomeText: { fontSize: 26, fontWeight: '800', color: '#2D3748', marginBottom: 12 }, mockLogo: { fontSize: 40, fontWeight: '900', color: '#38B2AC', marginBottom: 16 }, subtitle: { fontSize: 14, color: '#718096', textAlign: 'center' }, fieldContainer: { marginBottom: 16, width: '100%' }, errorBorder: { borderColor: '#E53E3E', borderWidth: 1.5 }, errorText: { color: '#E53E3E', fontSize: 12, marginTop: 4 }, forgotText: { fontSize: 13, color: '#38B2AC', fontWeight: '600' }, footerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 }, footerText: { color: '#718096', fontSize: 14 }, signUpText: { color: '#38B2AC', fontSize: 14, fontWeight: '700' } });