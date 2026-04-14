import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, Platform, StatusBar, FlatList, StyleSheet } from 'react-native';
import { ArrowLeft, MessageSquare, MapPin, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// 🌟 ดึงข้อมูลจาก Redux
import { useAppSelector } from '../../hooks/useRedux';

export default function SmartFeedPage() {
  const router = useRouter();
  
  // 🌟 ดึงข้อมูล User, ร้านทั้งหมด และประวัติคิวทั้งหมด
  const user = useAppSelector((state: any) => state.auth?.user) || { name: 'Taggsh' }; 
  const allPlaces = useAppSelector((state: any) => state.places?.places || []);
  const allTickets = useAppSelector((state: any) => state.queue?.allTickets || []);

  // =========================================================================
  // 🧠 [AI LOGIC] - วิเคราะห์ร้านแนะนำจากประวัติเช็คอินสำเร็จ
  // =========================================================================
  const aiRecommendedPlaces = useMemo(() => {
    // 1. หารายการคิวของ User ที่สถานะเป็น Completed (เช็คอินสำเร็จ)
    const completedTickets = allTickets.filter((t: any) => t.name === user.name && t.status === 'Completed');
    
    // 2. ดึงรหัสร้าน (shopId) ที่เคยไปมาแล้ว
    const bookedShopIds = completedTickets.map((t: any) => t.shopId);
    
    // 3. ดึงข้อมูลร้านที่เคยไป เพื่อดู Tags/Style (เช่น ชอบชาบู ชอบปิ้งย่าง)
    const bookedShops = allPlaces.filter((p: any) => bookedShopIds.includes(p.id));
    
    const favoriteTags = new Set<string>();
    bookedShops.forEach((shop: any) => shop.tags.forEach((tag: string) => favoriteTags.add(tag)));

    // 4. ค้นหาร้านแนะนำ: ต้องมีแนว (Tag) ตรงกับที่ชอบ + "ต้องยังไม่เคยจอง"
    let recommended = allPlaces.filter((p: any) => {
      if (bookedShopIds.includes(p.id)) return false; // ตัดร้านที่เคยจองแล้วออก
      return p.tags.some((tag: string) => favoriteTags.has(tag)); // เช็คว่ามี Tag ตรงกันไหม
    });

    // 5. Fallback เผื่อเป็นผู้ใช้ใหม่ไม่มีประวัติ ให้ดึงร้านที่ระบบตั้งค่า Recommended ไว้
    if (recommended.length === 0) {
      recommended = allPlaces.filter((p: any) => p.isRecommended && !bookedShopIds.includes(p.id));
    }

    return recommended;
  }, [allPlaces, allTickets, user.name]);
  // =========================================================================

  const renderPlaceCard = ({ item: place }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => Alert.alert('ดูรายละเอียด', `ร้าน ID: ${place.id}`)}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: place.logoUrl || place.image }} style={styles.cardImage} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.placeName}>{place.name}</Text>
        <View style={styles.infoRow}>
          <MapPin size={14} color="#6FA4A1" style={{ marginRight: 4 }} />
          <Text style={styles.distanceText}>{place.distance}</Text>
        </View>
        <View style={styles.tagsRow}>
          {place.tags.map((tag: string, idx: number) => (
            <Text key={idx} style={styles.tagText}>{tag}{idx < place.tags.length - 1 ? '    ' : ''}</Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerTitle}>AI แนะนำ</Text>
          <Sparkles size={18} color="#2D3748" style={{ marginLeft: 6 }}/>
        </View>
        {/* 🌟 ปุ่มมุมขวา เด้งไปหน้า AI Chat */}
        <TouchableOpacity onPress={() => router.push('/page/AIChat')} style={{ padding: 4 }}>
          <MessageSquare size={24} color="#6FA4A1" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          วิเคราะห์จากประวัติและสไตล์ร้านที่คุณชื่นชอบ เพื่อค้นหาร้านใหม่ๆ ที่คุณยังไม่เคยไป
        </Text>
      </View>

      <FlatList
        data={aiRecommendedPlaces}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaceCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>ไม่พบร้านแนะนำในขณะนี้</Text>}
      />
    </SafeAreaView>
  );
}

// 🌟 ใช้สไตล์ UI เดียวกับหน้า Restaurant เพื่อความคุ้นเคย
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  
  descriptionContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  descriptionText: { fontSize: 13, color: '#718096', lineHeight: 20, textAlign: 'center' },

  listContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#F1F5F9' },
  imageWrapper: { width: '100%', height: 170, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%' },
  
  cardContent: { padding: 16 },
  placeName: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  distanceText: { fontSize: 13, color: '#718096' },
  tagsRow: { flexDirection: 'row' },
  tagText: { fontSize: 13, color: '#6FA4A1', fontWeight: '500' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#A0AEC0', fontSize: 16 },
});