import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Search, Calendar, Store, LucideIcon, ShieldCheck, Database, BrainCircuit } from 'lucide-react-native';
import { useRouter, Href } from 'expo-router';

import { Button } from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../redux/useRedux';
import { updateConsent } from '../../redux/slices/authSlice';
import { User } from '../../types';

interface FeatureItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function AIConsentPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      // 🌟 อัปเดต Redux State เพียงอย่างเดียว (ไม่ต้อง Mock ลง AsyncStorage แล้ว)
      dispatch(updateConsent(true));
      
      // นำทางไปหน้าหลัก (ระบุไฟล์ให้ชัดเจน ป้องกันจอดำ)
      router.replace('/(tabs)/Home' as Href);
      
    } catch (error) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      console.error('Update failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const FeatureItem = ({ icon: Icon, title, description }: FeatureItemProps) => (
    <View style={styles.featureItem}>
      <View style={styles.iconCircle}>
        <Icon size={22} color="#6FA4A1" />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        <View style={styles.headerArea}>
          <View style={styles.imageContainer}>
            <View style={styles.aiImage}>
              <BrainCircuit size={64} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.mainTitle}>ยกระดับประสบการณ์ด้วย AI</Text>
          <Text style={styles.subtitle}>
            แอปพลิเคชัน QBuddy ใช้ปัญญาประดิษฐ์ (AI) ในการเรียนรู้พฤติกรรมของคุณ เพื่อนำเสนอสิ่งที่ตรงใจคุณที่สุด
          </Text>
        </View>

        <ScrollView 
          style={styles.featuresList} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <Text style={styles.sectionHeading}>ข้อมูลที่เราจัดเก็บและวิเคราะห์:</Text>
          
          <FeatureItem 
            icon={Search} 
            title="พฤติกรรมการค้นหา" 
            description="เราเรียนรู้จากคำค้นหา หมวดหมู่ร้านอาหาร และกิจกรรมที่คุณสนใจ เพื่อแนะนำสถานที่ที่ตรงกับไลฟ์สไตล์ของคุณในอนาคต" 
          />
          <FeatureItem 
            icon={Calendar} 
            title="ประวัติการจองคิว" 
            description="ระบบจะวิเคราะห์ช่วงเวลาที่คุณมักใช้บริการ (เช่น มื้อเที่ยง มื้อเย็น) และความถี่ในการไปร้านต่างๆ เพื่อคาดเดาความต้องการ" 
          />
          <FeatureItem 
            icon={Database} 
            title="การจัดเก็บที่ปลอดภัย" 
            description="ข้อมูลทั้งหมดจะถูกเข้ารหัส (Encryption) และเก็บรักษาไว้ในเซิร์ฟเวอร์ที่มีมาตรฐานความปลอดภัยสูงระดับสากล" 
          />
          <FeatureItem 
            icon={ShieldCheck} 
            title="ความเป็นส่วนตัวของคุณ" 
            description="เราใช้ข้อมูลเพื่อพัฒนาประสบการณ์ของคุณในแอปนี้เท่านั้น ไม่มีการส่งต่อ แลกเปลี่ยน หรือขายข้อมูลของคุณให้กับบุคคลที่สาม (Third-party) โดยเด็ดขาด" 
          />
        </ScrollView>

        <View style={styles.bottomSection}>
          <Text style={styles.agreementText}>
            การกดยินยอมหมายความว่าคุณได้อ่านและยอมรับนโยบายความเป็นส่วนตัวและเงื่อนไขการใช้บริการของ QBuddy
          </Text>
          <Button 
            title={isLoading ? "กำลังบันทึกข้อมูล..." : "ฉันเข้าใจและยินยอม"} 
            onPress={handleAccept} 
            disabled={isLoading}
            style={styles.acceptButton} 
          />
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  
  headerArea: { alignItems: 'center', marginBottom: 20 },
  imageContainer: { marginBottom: 20 },
  aiImage: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#6FA4A1', justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  mainTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', color: '#2D3748', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#718096', textAlign: 'center', lineHeight: 22 },
  
  featuresList: { flex: 1, marginTop: 10 },
  sectionHeading: { fontSize: 14, fontWeight: '700', color: '#4A5568', marginBottom: 16 },
  featureItem: { flexDirection: 'row', marginBottom: 20 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  featureTextContainer: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: '#2D3748', marginBottom: 4 },
  featureDescription: { fontSize: 13, color: '#718096', lineHeight: 20 },
  
  bottomSection: { width: '100%', paddingTop: 16, paddingBottom: 30, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F7FAFC' },
  agreementText: { fontSize: 12, color: '#A0AEC0', textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  acceptButton: { backgroundColor: '#6FA4A1', width: '100%', paddingVertical: 14 }
});