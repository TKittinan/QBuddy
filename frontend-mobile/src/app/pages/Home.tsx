import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Utensils, Calendar, Coffee, TreePine, Scissors, Sparkles, PlusSquare, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { HomeLayout } from '../../layouts/HomeLayout';
import { AIChat } from '../../components/ui/AIChat';
import { CategoryItem } from '../../components/ui/CategoryItem';

export default function HomePage() {
  const router = useRouter();

  // ฟังก์ชันจัดการการกดของแต่ละหมวดหมู่ (สำหรับหมวดหมู่ทั่วไป)
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
          {/* 👇 เพิ่มปุ่ม "ดูทั้งหมด" เพื่อเชื่อมไปหน้า SmartFeed 👇 */}
          <TouchableOpacity onPress={() => router.push('/pages/SmartFeed' as any)}>
            <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {/* 👇 ทำให้ตัวการ์ดรูปภาพสามารถกดเพื่อไปหน้า SmartFeed ได้ด้วย 👇 */}
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
          
          {/* ปุ่ม "หาเพื่อน" */}
          <CategoryItem 
            label="หาเพื่อน" 
            icon={<Users size={20} color="#38B2AC" />} 
            onPress={() => router.push('/pages/FindFriends' as any)} 
          />
        </View>

      </ScrollView>
    </HomeLayout>
  );
}

const styles = StyleSheet.create({
  scrollPadding: { paddingBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginRight: 8 },
  seeAllText: { fontSize: 14, fontWeight: '600', color: '#38B2AC' }, // เพิ่มสไตล์สำหรับข้อความ 'ดูทั้งหมด'
  horizontalScroll: { paddingLeft: 20, marginBottom: 10 },
  categoryGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20 
  },
});