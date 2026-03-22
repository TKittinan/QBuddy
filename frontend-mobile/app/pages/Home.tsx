import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Utensils, Calendar, Coffee, TreePine, Scissors, Sparkles, PlusSquare, Users } from 'lucide-react-native';

import { HomeLayout } from '../layout/HomeLayout';
import { AIChat } from '../components/ui/AIChat';
import { CategoryItem } from '../components/ui/CategoryItem';

export default function HomePage() {
  return (
    <HomeLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        
        {/* ส่วน AI Recommendation */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI Recommendation</Text>
          <Sparkles size={18} color="#2D3748" />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          <AIChat 
            title="ร้านอาหารสุดหรู"
            imageUri="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500"
            rating="4.8"
            location="มิชลินไกด์"
            distance="1.2 กม."
            tags={['Dinner', 'Italian']}
          />
          <AIChat 
            title="นิทรรศการศิลปะ"
            imageUri="https://images.unsplash.com/photo-1531260796528-af05fbb3f5bb?w=500"
            rating="4.9"
            location="ศิลปะร่วมสมัย"
            distance="3.5 กม."
            tags={['Art', 'Gallery']}
          />
        </ScrollView>

        {/* ส่วน Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>

        <View style={styles.categoryGrid}>
          <CategoryItem label="ร้านอาหาร" icon={<Utensils size={20} color="#DD6B20" />} />
          <CategoryItem label="อีเวนท์" icon={<Calendar size={20} color="#805AD5" />} />
          <CategoryItem label="คาเฟ่" icon={<Coffee size={20} color="#D69E2E" />} />
          <CategoryItem label="อุทยาน" icon={<TreePine size={20} color="#38A169" />} />
          <CategoryItem label="ร้านทำผม" icon={<Scissors size={20} color="#3182CE" />} />
          <CategoryItem label="เสริมสวยอื่นๆ" icon={<Sparkles size={20} color="#D53F8C" />} />
          <CategoryItem label="โรงพยาบาล" icon={<PlusSquare size={20} color="#E53E3E" />} />
          <CategoryItem label="นวด" icon={<Users size={20} color="#3182CE" />} />
          <CategoryItem label="หาเพื่อน" icon={<Users size={20} color="#38B2AC" />} />
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
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
});