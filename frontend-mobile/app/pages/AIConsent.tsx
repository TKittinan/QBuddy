import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Search, Calendar, Store } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/auth/use.Auth';

export default function AIConsentPage() {
  const router = useRouter();
  const { user, updateUserStatus } = useAuth(); // ดึงข้อมูลและฟังก์ชันอัปเดตจาก Context

  const handleAccept = async () => {
    try {
      // 1. อัปเดตในฐานข้อมูลจำลองเพื่อให้ข้อมูลติดตัว User ไปทุกเครื่อง
      const existingUsersJson = await AsyncStorage.getItem('mock_users_db');
      if (existingUsersJson) {
        const users = JSON.parse(existingUsersJson);
        const updatedUsers = users.map((u: any) => {
          if (u.email === user?.email) {
            return { ...u, ai_consented: true };
          }
          return u;
        });
        await AsyncStorage.setItem('mock_users_db', JSON.stringify(updatedUsers));
      }
      
      // 2. อัปเดตสถานะใน Auth Context เพื่อให้แอปทราบการเปลี่ยนแปลงทันที
      await updateUserStatus({ ai_consented: true });
      
      router.replace('/pages/Home');
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  const handleSkip = () => {
    router.replace('/pages/Home');
  };

  const FeatureItem = ({ icon: Icon, title, description }: any) => (
    <View style={styles.featureItem}>
      <View style={styles.iconCircle}><Icon size={24} color="#6FA4A1" /></View>
      <View style={styles.featureTextContainer}><Text style={styles.featureTitle}>{title}</Text><Text style={styles.featureDescription}>{description}</Text></View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.imageContainer}><View style={[styles.aiImage, {backgroundColor: '#CBD5E0'}]} /></View>
        <Text style={styles.mainTitle}>AI ทำให้คำแนะนำตรงใจคุณมากขึ้น</Text>
        <View style={styles.featuresList}>
          <FeatureItem icon={Search} title="ประวัติการค้นหา" description="เรียนรู้จากสิ่งที่คุณสนใจค้นหา" />
          <FeatureItem icon={Calendar} title="ประวัติการจอง" description="แนะนำจากร้านที่คุณเคยจอง" />
          <FeatureItem icon={Store} title="คิวที่ใช้บริการสำเร็จ" description="วิเคราะห์จากร้านที่คุณไปจริง" />
        </View>
        <View style={styles.bottomSection}>
          <Button title="ยินยอมและเริ่มใช้งาน" onPress={handleAccept} style={{ backgroundColor: '#6FA4A1', marginBottom: 16 }} />
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}><Text style={styles.skipText}>ข้ามไปก่อน</Text></TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EEF2F4' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 40, alignItems: 'center' },
  imageContainer: { marginBottom: 24 },
  aiImage: { width: 140, height: 140, borderRadius: 70 },
  mainTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 30 },
  featuresList: { width: '100%', flex: 1 },
  featureItem: { flexDirection: 'row', marginBottom: 24 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  featureTextContainer: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '700' },
  featureDescription: { fontSize: 13, color: '#718096' },
  bottomSection: { width: '100%', paddingBottom: 20 },
  skipButton: { alignItems: 'center' },
  skipText: { fontSize: 14, color: '#718096' },
});