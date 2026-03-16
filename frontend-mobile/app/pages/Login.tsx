import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Mail, EyeOff, Eye } from 'lucide-react-native';
import { AuthLayout } from '../layout/LoginLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <AuthLayout>
      
      {/* --- โซนโลโก้และคำทักทาย (ไม่มี Navigation Header) --- */}
      <View style={styles.heroContainer}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        
        {/* แนะนำให้เซฟรูปโลโก้ QBuddy แยกเป็นไฟล์ .png แล้วใส่ path ตรงนี้ครับ */}
        {/* <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" /> */}
        <Text style={styles.mockLogo}>QBuddy</Text> 
        
        <Text style={styles.subtitle}>
          Login to manage your queue and discover more.
        </Text>
      </View>

      {/* --- โซนฟอร์มกรอกข้อมูล --- */}
      <Input 
        label="Email or Phone"
        placeholder="Enter your email or phone number"
        value={email}
        onChangeText={setEmail}
        rightIcon={<Mail size={20} color="#64748B" />}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input 
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        rightIcon={showPassword ? <Eye size={20} color="#64748B" /> : <EyeOff size={20} color="#64748B" />}
        onRightIconPress={() => setShowPassword(!showPassword)}
        rightTopElement={
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.forgotText}>Forgot?</Text>
          </TouchableOpacity>
        }
      />

      {/* --- โซนปุ่ม Login --- */}
      <Button 
        title="เข้าสู่ระบบ" 
        onPress={() => console.log('Login pressed')} 
        style={{ marginTop: 8 }}
      />

      {/* --- โซน Divider (Or continue with) --- */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* --- โซน Social Login --- */}
      {/* ถ้ามี Icon ใส่ prop icon={<Image .../>} เข้าไปใน Button ได้เลยครับ */}
      <Button variant="social" title="Continue with Facebook" />
      <Button variant="social" title="Continue with Google" />
      <Button variant="social" title="Continue with LINE" />

      {/* --- โซน Footer --- */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.signUpText}>Sign up</Text>
        </TouchableOpacity>
      </View>

    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2D3748',
    marginBottom: 12,
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: 16,
  },
  mockLogo: {
    fontSize: 40,
    fontWeight: '900',
    color: '#38B2AC',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  forgotText: {
    fontSize: 13,
    color: '#38B2AC',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#A0AEC0',
    fontSize: 13,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  footerText: {
    color: '#718096',
    fontSize: 14,
  },
  signUpText: {
    color: '#38B2AC',
    fontSize: 14,
    fontWeight: '700',
  },
});