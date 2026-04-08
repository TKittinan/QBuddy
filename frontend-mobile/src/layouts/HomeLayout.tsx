// src/layouts/HomeLayout.tsx
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { Mic } from 'lucide-react-native';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/auth/use.Auth';

// 1. Import ตัว BottomNav ที่เราเพิ่งสร้าง
import { Navigation } from '../components/ui/Navigation';

interface HomeLayoutProps {
  children: React.ReactNode;
}

export const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.userInfoRow}>
          <View>
            <Text style={styles.greetText}>ยินดีต้อนรับกลับ</Text>
            <Text style={styles.userName}>สวัสดี คุณ {user?.name || 'User'}</Text>
          </View>
          <View style={styles.profileWrapper}>
            <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.profileImg} />
            <View style={styles.onlineStatus} />
          </View>
        </View>

        <Input 
          placeholder="อยากทำอะไรวันนี้?"
          inputContainerStyle={styles.searchBar}
          style={{ color: '#FFFFFF' }}
          rightIcon={<Mic size={20} color="#CBD5E0" />}
        />
      </View>

      <View style={styles.content}>
        {children}
      </View>

      {/* 🚨 2. เรียกใช้ Component และบอกว่าหน้าแรกคือแท็บ home */}
      <Navigation activeTab="home" />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: {
    backgroundColor: '#2D3748',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  userInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetText: { fontSize: 13, color: '#CBD5E0', fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  profileWrapper: { position: 'relative' },
  profileImg: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#38B2AC' },
  onlineStatus: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#48BB78', borderWidth: 2, borderColor: '#2D3748' },
  searchBar: { backgroundColor: 'rgba(255, 255, 255, 0.12)', borderWidth: 0, borderRadius: 12 },
  content: { flex: 1, backgroundColor: '#F7FAFC' },
});