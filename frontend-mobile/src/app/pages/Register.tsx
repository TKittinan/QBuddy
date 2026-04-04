import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ArrowLeft, EyeOff, Eye, CheckCircle2, XCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthLayout, UserRegCheck } from '../../layouts/AuthLayout'; 
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const mockRegisterAPI = async (userData: any) => {
  /*
  // ==============================================================
  // 🚀 FUTURE API: Insert เข้าตาราง User ใน Prisma
  // ==============================================================
  // try {
  //   const registerRes = await axios.post('/api/auth/register', {
  //     name: userData.fullName,
  //     email: userData.email,
  //     password: userData.password
  //     // Note: ตาราง User ใน Prisma ปัจจุบันไม่มี column 'phone' 
  //     // ต้องอัปเดต schema.prisma เพิ่ม phone String? ด้วยถ้าจะใช้งาน
  //   });
  //   return registerRes.data;
  // } catch (error) {
  //   throw new Error(error.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ');
  // }
  */

  await new Promise(resolve => setTimeout(resolve, 500));
  const existingUsersJson = await AsyncStorage.getItem('mock_users_db');
  const existingUsers = existingUsersJson ? JSON.parse(existingUsersJson) : [];

  const newUser = { id: `usr_${Date.now()}`, ...userData, ai_consented: false, role: 'user' };
  existingUsers.push(newUser);
  await AsyncStorage.setItem('mock_users_db', JSON.stringify(existingUsers));
  return newUser;
};

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordReqs, setPasswordReqs] = useState({ length8: false, hasUpper: false, hasLower: false });

  useEffect(() => {
    setPasswordReqs({
      length8: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
    });
  }, [password]);

  const renderReqItem = (isMet: boolean, text: string) => (
    <View style={styles.reqItemContainer}>
      {isMet ? <CheckCircle2 size={16} color="#38B2AC" style={styles.reqIcon} /> : <XCircle size={16} color="#A0AEC0" style={styles.reqIcon} />}
      <Text style={[styles.reqText, isMet ? styles.reqTextMet : styles.reqTextUnmet]}>{text}</Text>
    </View>
  );

  const handleRegister = async () => {
    setFullNameError(''); setEmailError(''); setPhoneError(''); setConfirmPasswordError('');
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return; 
    }

    let isValid = true;
    if (!validateEmail(email)) { setEmailError('รูปแบบอีเมลไม่ถูกต้อง'); isValid = false; }
    if (phone.length !== 10 || phone[0] !== '0') { setPhoneError('เบอร์โทรศัพท์ไม่ถูกต้อง'); isValid = false; }

    if (isValid) {
      setIsLoading(true);
      try {
        const checkResult = await UserRegCheck(fullName, email, phone);
        
        if (checkResult.isNameTaken) { setFullNameError('ชื่อนี้ถูกใช้งานไปแล้ว'); isValid = false; }
        if (checkResult.isEmailTaken) { setEmailError('อีเมลนี้ถูกใช้งานไปแล้ว'); isValid = false; }
        if (checkResult.isPhoneTaken) { setPhoneError('เบอร์โทรศัพท์นี้ถูกใช้งานไปแล้ว'); isValid = false; }

        if (!isValid) { setIsLoading(false); return; }

        await mockRegisterAPI({ fullName, email, phone, password });
        Alert.alert('สำเร็จ', 'สมัครสมาชิกเรียบร้อยแล้ว', [{ text: 'ตกลง', onPress: () => router.replace('/pages/Login') }]);
      } catch (error: any) {
        Alert.alert('เกิดข้อผิดพลาด', error.message);
      } finally { setIsLoading(false); }
    }
  };

  return (
    <AuthLayout>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#2D3748" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register</Text>
      </View>

      <View style={styles.fieldContainer}>
        <Input label="Full Name" placeholder="Full name" value={fullName} onChangeText={setFullName} inputContainerStyle={fullNameError ? styles.errorBorder : undefined} />
        {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
      </View>

      <View style={styles.fieldContainer}>
        <Input label="Email" placeholder="example@email.com" value={email} onChangeText={setEmail} inputContainerStyle={emailError ? styles.errorBorder : undefined} />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      </View>

      <View style={styles.fieldContainer}>
        <Input label="Phone Number" placeholder="0XXXXXXXXX" value={phone} onChangeText={setPhone} maxLength={10} inputContainerStyle={phoneError ? styles.errorBorder : undefined} />
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
      </View>

      <View style={styles.fieldContainer}>
        <Input label="Password" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} rightIcon={showPassword ? <Eye size={20} color="#64748B" /> : <EyeOff size={20} color="#64748B" />} onRightIconPress={() => setShowPassword(!showPassword)} />
        <View style={styles.passwordRequirements}>
          {renderReqItem(passwordReqs.length8, 'อย่างน้อย 8 ตัวอักษร')}
          {renderReqItem(passwordReqs.hasUpper, 'มีตัวอักษรพิมพ์ใหญ่ (A-Z)')}
          {renderReqItem(passwordReqs.hasLower, 'มีตัวอักษรพิมพ์เล็ก (a-z)')}
        </View>
      </View>

      <View style={styles.fieldContainer}>
        <Input label="Confirm Password" placeholder="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} inputContainerStyle={confirmPasswordError ? styles.errorBorder : undefined} />
        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
      </View>

      <Button title={isLoading ? "กำลังสมัคร..." : "สมัครสมาชิก"} onPress={handleRegister} disabled={isLoading} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative' },
  backButton: { position: 'absolute', left: 0 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  fieldContainer: { marginBottom: 16 },
  errorBorder: { borderColor: '#E53E3E', borderWidth: 1.5 },
  errorText: { color: '#E53E3E', fontSize: 12, marginTop: 4 },
  passwordRequirements: { marginTop: 8 }, 
  reqItemContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  reqIcon: { marginRight: 6 },
  reqText: { fontSize: 12 },
  reqTextMet: { color: '#38B2AC' },
  reqTextUnmet: { color: '#A0AEC0' },
});