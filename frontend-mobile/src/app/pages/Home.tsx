import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Utensils, Calendar, Coffee, TreePine, Scissors, Sparkles, PlusSquare, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { HomeLayout } from '../../layouts/HomeLayout';
import { AIChat } from '../../components/ui/AIChat';
import { CategoryItem } from '../../components/ui/CategoryItem';
import { useAuth } from '../../context/auth/use.Auth';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  /*
  // ==============================================================
  // 🚀 FUTURE API: ดึงข้อมูลหน้า Home (แนะนำให้ใช้ React Query)
  // ==============================================================
  // useEffect(() => {
  //   const fetchHomeData = async () => {
  //     // 1. ดึง AI Recommendation คัดมาแค่ 1 อันดับแรกโชว์หน้า Home
  //     const topRecRes = await axios.get(`/api/recommendations/${user?.id}?limit=1`);
  //     setTopRecommendation(topRecRes.data);
  //
  //     // 2. ดึง Categories จากตาราง Category ใน DB
  //     const categoriesRes = await axios.get('/api/categories');
  //     setCategories(categoriesRes.data);
  //   };
  //   fetchHomeData();
  // }, []);
  */

  const handleCategoryPress = (category: string) => {
    router.push(`/pages/category/${category}` as any);
  };

  return (
    <HomeLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        
        {/* ส่วน AI Recommendation */}
        <View style={[styles.sectionHeader, { justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>AI Recommendation</Text>
            <Sparkles size={18} color="#2D3748" />
          </View>
          <TouchableOpacity onPress={() => router.push('/pages/SmartFeed' as any)}>
            <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/pages/SmartFeed' as any)}>
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

        {/* ส่วน Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>

        <View style={styles.categoryGrid}>
          <CategoryItem label="ร้านอาหาร" icon={<Utensils size={20} color="#DD6B20" />} onPress={() => handleCategoryPress('restaurant')} />
          <CategoryItem label="อีเวนท์" icon={<Calendar size={20} color="#805AD5" />} onPress={() => handleCategoryPress('event')} />
          <CategoryItem label="คาเฟ่" icon={<Coffee size={20} color="#D69E2E" />} onPress={() => handleCategoryPress('cafe')} />
          <CategoryItem label="อุทยาน" icon={<TreePine size={20} color="#38A169" />} onPress={() => handleCategoryPress('park')} />
          <CategoryItem label="หาเพื่อน" icon={<Users size={20} color="#38B2AC" />} onPress={() => router.push('/pages/FindFriends' as any)} />
        </View>

      </ScrollView>
    </HomeLayout>
  );
}

const styles = StyleSheet.create({
  scrollPadding: { paddingBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginRight: 8 },
  seeAllText: { fontSize: 14, fontWeight: '600', color: '#38B2AC' },
  horizontalScroll: { paddingLeft: 20, marginBottom: 10 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
});