import React, { useState, useMemo, useCallback, useEffect } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, FlatList, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../redux/useRedux';
import { CategoryChips } from '../../components/ui/CategoryChips';
import { fetchPlacesAsync } from '../../redux/slices/placeSlice';
import { Card } from '../../components/ui/Card';
import { Place } from '../../types';
import * as Location from 'expo-location'; //  เพิ่มการนำเข้า Location

interface LocalRootState { places: { places: Place[] | { data: Place[] } }; }

export default function Restaurant() { 
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeCategoryTag = 'ร้านอาหาร'; 
  const rawPlaces = useAppSelector((state: LocalRootState) => state.places.places);
  const allPlaces = Array.isArray(rawPlaces) ? rawPlaces : [];
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedCount, setDisplayedCount] = useState(10); 
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null); //  State เก็บตำแหน่งผู้ใช้

  const FILTER_TAGS = ['ร้านอาหาร', 'คาเฟ่', 'เสริมสวยอื่นๆ', 'ยอดฮิต'];

  //  ฟังก์ชันคำนวณระยะทาง
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  useEffect(() => {
    //  ขอสิทธิ์และดึงตำแหน่งปัจจุบันของผู้ใช้
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      }
    })();

    if (allPlaces.length === 0) {
      dispatch(fetchPlacesAsync());
    }
  }, [dispatch, allPlaces.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchPlacesAsync());
    setRefreshing(false);
  }, [dispatch]);

  const handleCategoryChange = (tag: string) => {
    if (tag === activeCategoryTag) return;
    if (tag === 'ยอดฮิต') router.replace('/page/Trending');
    else if (tag === 'ร้านอาหาร') router.replace('/page/Restaurant');
    else if (tag === 'คาเฟ่') router.replace('/page/Cafe');
    else if (tag === 'เสริมสวยอื่นๆ') router.replace('/page/Beauty');
  };

  const filteredPlaces = useMemo(() => {
    const basePlaces = allPlaces.filter((place: Place) => {
      if (place.status?.toLowerCase() !== 'active') return false;
      if (!place.category) return false;
      return place.category.split(',').map(c => c.trim()).includes(activeCategoryTag);
    });
    if (!searchQuery) return basePlaces;
    return basePlaces.filter((place: Place) => {
      const matchName = place.name.toLowerCase().includes(searchQuery.toLowerCase());
      const categoriesArray = place.category ? place.category.split(',').map(c => c.trim().toLowerCase()) : [];
      const matchCategory = categoriesArray.some(c => c.includes(searchQuery.toLowerCase()));
      return matchName || matchCategory;
    });
  }, [allPlaces, searchQuery, activeCategoryTag]);

  const displayedPlaces = useMemo(() => filteredPlaces.slice(0, displayedCount), [filteredPlaces, displayedCount]);

  const loadMorePlaces = useCallback(() => {
    if (displayedCount < filteredPlaces.length && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => { setDisplayedCount(prev => prev + 10); setLoadingMore(false); }, 500); 
    }
  }, [displayedCount, filteredPlaces.length, loadingMore]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}><ArrowLeft size={24} color="#1F2937" /></TouchableOpacity>
        <Text style={styles.headerTitle}>{activeCategoryTag}</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.searchPadding}>
        <View style={styles.searchMinimalWrapper}>
          <Search size={18} color="#A0AEC0" />
          <TextInput style={styles.searchInput} placeholder={`ค้นหา${activeCategoryTag}...`} placeholderTextColor="#A0AEC0" value={searchQuery} onChangeText={setSearchQuery} />
        </View>
      </View>

      <View style={{ backgroundColor: '#FFFFFF' }}>
        <CategoryChips tags={FILTER_TAGS} activeTag={activeCategoryTag} onTagPress={handleCategoryChange} showFlameOn="ยอดฮิต" />
      </View>

      <FlatList
        data={displayedPlaces}
        keyExtractor={(item: Place) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6FA4A1']} tintColor="#6FA4A1" />}
        renderItem={({ item }) => {
          //  คำนวณระยะทางสำหรับร้านนี้
          const dist = userLocation && item.lat && item.lng
            ? `${calculateDistance(userLocation.coords.latitude, userLocation.coords.longitude, parseFloat(item.lat as any), parseFloat(item.lng as any))} กม.`
            : "ไม่ทราบระยะทาง";

          return (
            <Card 
              place={item} 
              title={item.name} 
              location={item.branch} 
              distance={dist} //  ส่งระยะทางที่คำนวณได้จริงไปที่ Card
              category={item.category} 
              onPress={() => router.push({ pathname: '/page/PlaceDetail', params: { id: item.id } })} 
            />
          );
        }}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>ไม่พบข้อมูลในหมวดหมู่นี้</Text>}
        onEndReached={loadMorePlaces}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => loadingMore ? <ActivityIndicator size="large" color="#6FA4A1" style={{ marginVertical: 20 }} /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  searchPadding: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: '#FFFFFF' },
  searchMinimalWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 16, borderRadius: 16, height: 48, borderWidth: 1, borderColor: '#EDF2F7' }, 
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#2D3748', height: '100%' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  emptyText: { textAlign: 'center', color: '#A0AEC0', marginTop: 40, fontSize: 14 }
});