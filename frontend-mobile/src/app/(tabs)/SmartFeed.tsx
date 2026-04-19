import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, Platform, StatusBar, FlatList, StyleSheet } from 'react-native';
import { ArrowLeft, MessageSquare, MapPin, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../../redux/useRedux';
import * as Location from 'expo-location'; // นำเข้า Location

export default function SmartFeedPage() {
  const router = useRouter();
  
  const user = useAppSelector((state: any) => state.auth?.user); 
  const placesState = useAppSelector((state: any) => state.places);
  const rawPlaces = placesState?.places?.data || placesState?.places || [];
  const allPlaces = Array.isArray(rawPlaces) ? rawPlaces : [];

  const queueState = useAppSelector((state: any) => state.queue);
  const rawTickets = queueState?.tickets?.data || queueState?.tickets || queueState?.allTickets?.data || queueState?.allTickets || [];
  const allTickets = Array.isArray(rawTickets) ? rawTickets : [];

  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null); // State เก็บตำแหน่งผู้ใช้

  // ฟังก์ชันคำนวณระยะทาง (Haversine Formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // รัศมีโลกเป็นกิโลเมตร
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  useEffect(() => {
    // ขอสิทธิ์และดึงตำแหน่งปัจจุบันของผู้ใช้
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      }
    })();
  }, []);

  const aiRecommendedPlaces = useMemo(() => {
    if (!user) return [];
    
    const completedTickets = allTickets.filter(
      (t: any) => (t.userId === user.id || t.name === user.name) && (t.status === 'Completed' || t.status === 'COMPLETED')
    );
    
    const bookedShopIds = completedTickets.map((t: any) => t.shopId || t.placeId);
    const bookedShops = allPlaces.filter((p: any) => bookedShopIds.includes(p.id));
    
    const favoriteCategories = new Set<string>();
    bookedShops.forEach((shop: any) => {
      if (shop.category) favoriteCategories.add(shop.category);
    });

    let recommended = allPlaces.filter((p: any) => {
      if (bookedShopIds.includes(p.id)) return false; 
      return favoriteCategories.has(p.category); 
    });

    if (recommended.length === 0) {
      recommended = allPlaces.filter((p: any) => p.isRecommended && !bookedShopIds.includes(p.id));
    }

    if (recommended.length === 0) {
      recommended = allPlaces.filter((p: any) => !bookedShopIds.includes(p.id)).slice(0, 5);
    }

    return recommended;
  }, [allPlaces, allTickets, user]);

  const handleViewDetail = (id: string) => {
    router.push({
      pathname: '/page/PlaceDetail',
      params: { id }
    });
  };

  const renderPlaceCard = ({ item: place }: { item: any }) => {
    // คำนวณระยะทางโดยใช้ lat และ lng ตามไฟล์ types ของคุณ
    const dist = userLocation && place.lat && place.lng
      ? `${calculateDistance(userLocation.coords.latitude, userLocation.coords.longitude, parseFloat(place.lat), parseFloat(place.lng))} กม.`
      : 'ไม่ทราบระยะทาง';

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => handleViewDetail(place.id)}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: place.image || place.logoUrl }} style={styles.cardImage} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.placeName}>{place.name}</Text>
          <View style={styles.infoRow}>
            <MapPin size={14} color="#6FA4A1" style={{ marginRight: 4 }} />
            <Text style={styles.distanceText}>{dist}</Text>
          </View>
          <View style={styles.tagsRow}>
            {place.category && <Text style={styles.tagText}>{place.category}</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        <TouchableOpacity onPress={() => router.push('/page/AIChat')} style={{ padding: 4 }}>
          <MessageSquare size={24} color="#6FA4A1" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          วิเคราะห์จากประวัติและหมวดหมู่ร้านที่คุณชื่นชอบ เพื่อค้นหาร้านใหม่ๆ ที่คุณยังไม่เคยไป
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
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tagText: { fontSize: 13, color: '#6FA4A1', fontWeight: '500', marginBottom: 4 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#A0AEC0', fontSize: 16 },
});