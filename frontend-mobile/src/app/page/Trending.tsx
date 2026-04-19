import React, { useState, useMemo, useCallback, useEffect } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, FlatList, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useAppSelector, useAppDispatch } from '../../redux/useRedux';
// 🌟 เปลี่ยนมา import ตัว fetchWeeklyTrendingAsync
import { fetchWeeklyTrendingAsync } from '../../redux/slices/placeSlice'; 

import { Card } from '../../components/ui/Card'; 
import { CategoryChips } from '../../components/ui/CategoryChips'; 
import { Place } from '../../types';

export default function Trending() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // 🌟 ดึงข้อมูลจาก state.places.weeklyTrending แทน
  const placesState = useAppSelector((state: any) => state.places);
  const rawPlaces = placesState?.weeklyTrending || [];
  const allPlaces = Array.isArray(rawPlaces) ? rawPlaces : [];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('ทั้งหมด');
  const [displayedCount, setDisplayedCount] = useState(10); // แสดงทีละ 10 ไปเลย
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 🌟 เรียกใช้ fetchWeeklyTrendingAsync ตอนเปิดหน้า
  useEffect(() => {
    if (allPlaces.length === 0) {
      dispatch(fetchWeeklyTrendingAsync());
    }
  }, [dispatch, allPlaces.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchWeeklyTrendingAsync());
    setRefreshing(false);
  }, [dispatch]);

  const filterTags = ['ทั้งหมด', 'ร้านอาหาร', 'คาเฟ่', 'เสริมสวยอื่นๆ'];

  const processedPlaces = useMemo(() => {
    let result = [...allPlaces];
    
    if (activeTag !== 'ทั้งหมด') {
      result = result.filter((place: Place) => 
        place.category && place.category.includes(activeTag)
      );
    }
    
    if (searchQuery) {
      result = result.filter((place: Place) => 
        place.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // 🌟 ไม่ต้อง sort แล้ว เพราะ Backend เรียง 10 อันดับแรกมาให้แล้ว
    return result;
  }, [allPlaces, activeTag, searchQuery]);

  const displayedPlaces = useMemo(() => {
    return processedPlaces.slice(0, displayedCount);
  }, [processedPlaces, displayedCount]);

  const loadMorePlaces = useCallback(() => {
    if (displayedCount < processedPlaces.length && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setDisplayedCount(prev => prev + 10);
        setLoadingMore(false);
      }, 500); 
    }
  }, [displayedCount, processedPlaces.length, loadingMore]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ยอดฮิต 🚀</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.searchPadding}>
        <View style={styles.searchMinimalWrapper}>
          <Search size={18} color="#DD6B20" />
          <TextInput 
            style={styles.searchInput}
            placeholder="ค้นหาร้านยอดฮิต..."
            placeholderTextColor="#FBD38D"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={{ paddingLeft: 20, paddingBottom: 16, backgroundColor: '#FFFFFF' }}>
        <CategoryChips tags={filterTags} activeTag={activeTag} onTagPress={setActiveTag} />
      </View>

      <FlatList
        data={displayedPlaces}
        keyExtractor={(item: Place) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DD6B20']} tintColor="#DD6B20" />
        }
        renderItem={({ item, index }) => (
          <View style={{ position: 'relative' }}>
            <Card 
              title={item.name} 
              imageUri={item.image} 
              location={item.branch} 
              distance={typeof item.distance === 'number' ? `${item.distance} กม.` : item.distance} 
              category={item.category} 
              // 🌟 แก้ตรงนี้เพื่อให้ Badge แจ้งเตือนแสดงยอดของสัปดาห์นี้
              place={{ ...item, monthlyBookings: (item as any).weeklyBookings }} 
              showBookingBadge={true}
              onPress={(id: string) => router.push({ pathname: '/page/PlaceDetail', params: { id } })}
            />
            {index < 3 && (
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>ยังไม่มีข้อมูลการจองในสัปดาห์นี้</Text>}
        onEndReached={loadMorePlaces}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Top 10 ร้านฮิตสัปดาห์นี้!</Text>
            <Text style={styles.listSubtitle}>จัดอันดับจากยอดการจองสูงสุดในรอบ 7 วันล่าสุด</Text>
          </View>
        }
        ListFooterComponent={() => loadingMore ? <ActivityIndicator size="large" color="#DD6B20" style={{ marginVertical: 20 }} /> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#DD6B20' }, 
  searchPadding: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: '#FFFFFF' },
  searchMinimalWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', paddingHorizontal: 16, borderRadius: 24, height: 48, borderWidth: 1, borderColor: '#FEEBC8' }, 
  searchInput: { flex: 1, fontSize: 15, color: '#DD6B20', marginLeft: 8, height: '100%' },
  listHeader: { marginBottom: 20 },
  listTitle: { fontSize: 20, fontWeight: '900', color: '#2D3748', marginBottom: 4 },
  listSubtitle: { fontSize: 13, color: '#718096' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  emptyText: { textAlign: 'center', color: '#A0AEC0', marginTop: 40, fontSize: 14 },
  rankBadge: { position: 'absolute', top: -10, left: -10, backgroundColor: '#DD6B20', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF', zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  rankText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' }
});