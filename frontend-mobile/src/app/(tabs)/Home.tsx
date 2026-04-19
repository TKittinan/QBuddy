import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Utensils, Coffee, Scissors, Users, Sparkles } from 'lucide-react-native';
import { useRouter, Href, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location'; // เพิ่มการนำเข้า Location

import { AIChat } from '../../components/ui/AIChat';
import { CategoryItem } from '../../components/ui/CategoryItem';
import { Input } from '../../components/ui/Input';
import { useAppSelector, useAppDispatch } from '../../redux/useRedux';

import { fetchSavedPlacesAsync } from '../../redux/slices/savedPlacesSlice';
import { fetchWeeklyTrendingAsync } from '../../redux/slices/placeSlice';

export default function HomePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const user = useAppSelector((state: any) => state.auth?.user);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null); // State เก็บตำแหน่งผู้ใช้

  // ดึงข้อมูลฮิตประจำสัปดาห์ (Weekly) แล้วหั่นเอาแค่ 5 อันดับแรก
  const weeklyTrending = useAppSelector((state: any) => state.places?.weeklyTrending || []);
  const top5Places = weeklyTrending.slice(0, 5);

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
    return (R * c).toFixed(1); // คืนค่าเป็นกม. ทศนิยม 1 ตำแหน่ง
  };

  useFocusEffect(
    useCallback(() => {
      const fetchHomeData = async () => {
        try {
          // ขอสิทธิ์และดึงตำแหน่งปัจจุบัน
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            let location = await Location.getCurrentPositionAsync({});
            setUserLocation(location);
          }

          const storedAvatar = await AsyncStorage.getItem('@user_avatar');
          if (storedAvatar) setAvatarUri(storedAvatar);
          
          if (user?.id) {
            dispatch(fetchSavedPlacesAsync(user.id));
          }
          dispatch(fetchWeeklyTrendingAsync());
        } catch (error) {
          console.error("Failed to load home data", error);
        }
      };
      fetchHomeData();
    }, [user?.id, dispatch])
  );

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      router.push({
        pathname: '/page/AIChat',
        params: { initialMessage: searchQuery }
      } as any);
      setSearchQuery('');
    }
  };

  const displayAvatar = user?.avatarUrl || avatarUri || 'https://i.pravatar.cc/150?u=a042581f4e29026024d';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.headerContainer}>
        <View style={styles.userInfoRow}>
          <View>
            <Text style={styles.greetText}>ยินดีต้อนรับกลับ</Text>
            <Text style={styles.userName}>สวัสดี คุณ {user?.name || 'User'}</Text>
          </View>
          <View style={styles.profileWrapper}>
            <Image source={{ uri: displayAvatar }} style={styles.profileImg} />
            <View style={styles.onlineStatus} />
          </View>
        </View>
        
        <Input 
          placeholder="อยากทำอะไรวันนี้?" 
          inputContainerStyle={styles.searchBar} 
          style={{ color: '#FFFFFF' }} 
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="send" 
          onSubmitEditing={handleSearchSubmit} 
        />
      </View>

      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
          
          <View style={[styles.sectionHeader, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>TOP 10</Text>
              <Sparkles size={18} color="#2D3748" />
            </View>
            <TouchableOpacity onPress={() => router.push('/page/Trending' as any)}>
              <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {top5Places.length > 0 ? (
              top5Places.map((place: any, index: number) => {
                let imgArray: string[] = [];
                const parseString = (str: string | undefined) => {
                  if (!str) return [];
                  if (str.startsWith('[') && str.endsWith(']')) {
                    try { return JSON.parse(str); } catch (e) { return [str]; }
                  }
                  if (str.includes(',')) return str.split(',').map((s: string) => s.trim());
                  return [str];
                };
                if (place.coverUrl) imgArray = parseString(place.coverUrl);
                if (imgArray.length === 0 && place.image) imgArray = parseString(place.image);
                const displayImg = imgArray[0] || 'https://via.placeholder.com/400x200';
                
                const tags = place.category ? place.category.split(',').map((c: string) => c.trim()).slice(0, 2) : [];

                // คำนวณระยะทางจริง
                const dist = userLocation && place.latitude && place.longitude
                  ? `${calculateDistance(userLocation.coords.latitude, userLocation.coords.longitude, parseFloat(place.latitude), parseFloat(place.longitude))} กม.`
                  : '-';

                return (
                  <TouchableOpacity 
                    key={place.id || index} 
                    activeOpacity={0.9} 
                    onPress={() => router.push({ pathname: '/page/PlaceDetail', params: { id: place.id } } as any)}
                  >
                    <AIChat
                      title={place.name} 
                      imageUri={displayImg} 
                      location={place.branch || 'สาขาหลัก'} 
                      distance={dist} // ส่งระยะทางที่คำนวณได้ไป
                      tags={tags} 
                    />
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={{ marginLeft: 20, color: '#718096' }}>กำลังวิเคราะห์ข้อมูลร้าน...</Text>
            )}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
          
          <View style={styles.categoryGrid}>
            <CategoryItem 
              label="ร้านอาหาร" 
              icon={<Utensils size={20} color="#DD6B20" />} 
              onPress={() => router.push('/page/Restaurant' as Href)} 
            />
            <CategoryItem 
              label="คาเฟ่" 
              icon={<Coffee size={20} color="#D69E2E" />} 
              onPress={() => router.push('/page/Cafe' as Href)} 
            />
            <CategoryItem 
              label="เสริมสวยอื่นๆ" 
              icon={<Scissors size={20} color="#805AD5" />} 
              onPress={() => router.push('/page/Beauty' as Href)} 
            />
            <CategoryItem 
              label="หาเพื่อน" 
              icon={<Users size={20} color="#38B2AC" />} 
              onPress={() => router.push('/(tabs)/FindFriends' as Href)} 
            />
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#2D3748' }, 
  headerContainer: { backgroundColor: '#2D3748', paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
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