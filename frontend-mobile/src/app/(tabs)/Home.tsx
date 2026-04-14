import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, Platform, StatusBar } from 'react-native';
import { Utensils, Coffee, Scissors, Users, Sparkles } from 'lucide-react-native';
import { useRouter, Href, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AIChat } from '../../components/ui/AIChat';
import { CategoryItem } from '../../components/ui/CategoryItem';
import { Input } from '../../components/ui/Input';
import { useAppSelector } from '../../hooks/useRedux';

export default function HomePage() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 🌟 โหลดข้อมูลเมื่อเข้ามาหน้า Home
  useFocusEffect(
    useCallback(() => {
      const fetchHomeData = async () => {
        try {
          // =========================================================================
          // 🗄️ [SUPABASE DB CONNECTION MOCKUP] - ดึงรูปโปรไฟล์ และ ร้านแนะนำ
          // =========================================================================
          /*
          // 1. ดึงรูปโปรไฟล์
          if (user?.id) {
            const { data: userData } = await supabase.from('users').select('avatar_url').eq('id', user.id).single();
            if (userData?.avatar_url) setAvatarUri(userData.avatar_url);
          }
          
          // 2. ดึงรายการ AI Recommendation
          // const { data: aiRecs } = await supabase.from('places').select('*').eq('is_recommended', true).limit(5);
          */
          // =========================================================================

          // โหลดรูปจาก Local (Mock)
          const storedAvatar = await AsyncStorage.getItem('@user_avatar');
          if (storedAvatar) {
            setAvatarUri(storedAvatar);
          }
        } catch (error) {
          console.error("Failed to load home data", error);
        }
      };
      fetchHomeData();
    }, [user?.id])
  );

  // 🌟 ฟังก์ชันส่งข้อความไปหน้า AI Chat
  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      router.push({
        pathname: '/page/AIChat',
        params: { initialMessage: searchQuery }
      });
      setSearchQuery('');
    }
  };

  // 🌟 ฟังก์ชันเปิดหน้าหมวดหมู่ (หน้ารายการร้านค้า)
  const goToCategory = (categoryName: string) => {
    router.push({
      pathname: '/page/Restaurant', // ✅ วิ่งไปหน้า List ร้านค้าที่เราสร้างไว้
      params: { category: categoryName }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        {/* User Info & Profile Picture */}
        <View style={styles.userInfoRow}>
          <View>
            <Text style={styles.greetText}>ยินดีต้อนรับกลับ</Text>
            <Text style={styles.userName}>สวัสดี คุณ {user?.name || 'User'}</Text>
          </View>
          <View style={styles.profileWrapper}>
            <Image 
              source={{ uri: avatarUri || 'https://i.pravatar.cc/150?u=a042581f4e29026024d' }} 
              style={styles.profileImg} 
            />
            <View style={styles.onlineStatus} />
          </View>
        </View>
        
        {/* 🌟 ช่องแชทคุยกับ AI (เอาไมค์ออก พิมพ์ได้จริง) */}
        <Input 
          placeholder="อยากทำอะไรวันนี้?" 
          inputContainerStyle={styles.searchBar} 
          style={{ color: '#FFFFFF' }} 
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="send" // เปลี่ยนปุ่มบนคีย์บอร์ดเป็นปุ่ม Send
          onSubmitEditing={handleSearchSubmit} // กด Send ปุ๊บ วิ่งไปหน้า AI Chat ปั๊บ
        />
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
          
          {/* AI Recommendation Section */}
          <View style={[styles.sectionHeader, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>AI Recommendation</Text>
              <Sparkles size={18} color="#2D3748" />
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/SmartFeed' as Href)}>
              <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/(tabs)/SmartFeed' as Href)}>
              <AIChat 
                title="ร้านอาหารสุดหรู" 
                imageUri="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500" 
                rating="4.8" 
                location="มิชลินไกด์" 
                distance="1.2 กม." 
                tags={['Dinner', 'Italian']} 
              />
            </TouchableOpacity>
          </ScrollView>

          {/* Categories Section 🌟 (แก้หมวดหมู่ตามที่คุณ Tee สั่ง) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
          
          <View style={styles.categoryGrid}>
            <CategoryItem 
              label="ร้านอาหาร" 
              icon={<Utensils size={20} color="#DD6B20" />} 
              onPress={() => goToCategory('ร้านอาหาร')} 
            />
            <CategoryItem 
              label="คาเฟ่" 
              icon={<Coffee size={20} color="#D69E2E" />} 
              onPress={() => goToCategory('คาเฟ่')} 
            />
            <CategoryItem 
              label="เสริมสวยอื่นๆ" 
              icon={<Scissors size={20} color="#805AD5" />} 
              onPress={() => goToCategory('เสริมสวยอื่นๆ')} 
            />
            <CategoryItem 
              label="หาเพื่อน" 
              icon={<Users size={20} color="#38B2AC" />} 
              onPress={() => router.push('/(tabs)/FindFriends' as Href)} // ✅ วิ่งไปหน้าหาเพื่อน
            />
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: { backgroundColor: '#2D3748', paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 20, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  userInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetText: { fontSize: 13, color: '#CBD5E0', fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  profileWrapper: { position: 'relative' },
  profileImg: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#38B2AC' },
  onlineStatus: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#48BB78', borderWidth: 2, borderColor: '#2D3748' },
  
  searchBar: { backgroundColor: 'rgba(255, 255, 255, 0.12)', borderWidth: 0, borderRadius: 12 },
  
  content: { flex: 1, backgroundColor: '#F7FAFC' },
  scrollPadding: { paddingBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginRight: 8 },
  seeAllText: { fontSize: 14, fontWeight: '600', color: '#38B2AC' },
  horizontalScroll: { paddingLeft: 20, marginBottom: 10 },
  
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
});