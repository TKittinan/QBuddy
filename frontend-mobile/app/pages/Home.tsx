import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Utensils, Calendar, Coffee, TreePine, Scissors, Sparkles, PlusSquare, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router'; // จัดการการเชื่อมต่อที่ระดับหน้า Page

import { HomeLayout } from '../layout/HomeLayout';
import { AIChat } from '../components/ui/AIChat'; // หรือ RecommendationCard
import { CategoryItem } from '../components/ui/CategoryItem';

export default function HomePage() {
  const router = useRouter();

  // ฟังก์ชันจัดการการกดของแต่ละหมวดหมู่
  const handleCategoryPress = (category: string) => {
    // ส่งผู้ใช้ไปยังหน้าที่ต้องการ (Dynamic Route)
    router.push(`/pages/category/${category}` as any);
  };

  return (
    <HomeLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        
        {/* ส่วน AI Recommendation */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Recommendation</Text>
          <Sparkles size={18} color="#2D3748" />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {/* ส่วนนี้ใช้ Component AIChat เดิมของคุณ */}
          <AIChat 
            title="ร้านอาหารสุดหรู"
            imageUri="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500"
            rating="4.8"
            location="มิชลินไกด์"
            distance="1.2 กม."
            tags={['Dinner', 'Italian']}
          />
        </ScrollView>

        {/* ส่วน Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>

        <View style={styles.categoryGrid}>
          {/* กำหนดการเชื่อมโยง (onPress) ที่นี่โดยตรง */}
          <CategoryItem 
            label="ร้านอาหาร" 
            icon={<Utensils size={20} color="#DD6B20" />} 
            onPress={() => handleCategoryPress('restaurant')}
          />
          <CategoryItem 
            label="อีเวนท์" 
            icon={<Calendar size={20} color="#805AD5" />} 
            onPress={() => handleCategoryPress('event')}
          />
          <CategoryItem 
            label="คาเฟ่" 
            icon={<Coffee size={20} color="#D69E2E" />} 
            onPress={() => handleCategoryPress('cafe')}
          />
          <CategoryItem 
            label="อุทยาน" 
            icon={<TreePine size={20} color="#38A169" />} 
            onPress={() => handleCategoryPress('park')}
          />
          {/* หมวดหมู่ที่เหลือ... */}
        </View>

      </ScrollView>
    </HomeLayout>
  );
}

const styles = StyleSheet.create({
  scrollPadding: { paddingBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginRight: 8 },
  horizontalScroll: { paddingLeft: 20, marginBottom: 10 },
  categoryGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20 
  },
});