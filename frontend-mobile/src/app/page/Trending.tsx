import React, { useState, useMemo, useCallback, useEffect } from 'react'; 
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, FlatList, ActivityIndicator, TextInput, RefreshControl, ScrollView } from 'react-native';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useAppSelector, useAppDispatch } from '../../redux/useRedux';
import { fetchWeeklyTrendingAsync } from '../../redux/slices/placeSlice'; 

import { Card } from '../../components/ui/Card'; 
import { CategoryChips } from '../../components/ui/CategoryChips'; 
import { Place } from '../../types';

export default function Trending() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeCategoryTag = 'ยอดฮิต'; 
  
  const placesState = useAppSelector((state: any) => state.places);
  const rawPlaces = placesState?.weeklyTrending || [];
  const allPlaces = Array.isArray(rawPlaces) ? rawPlaces : [];

  const [searchQuery, setSearchQuery] = useState('');
  const [displayedCount, setDisplayedCount] = useState(10); 
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const FILTER_TAGS = ['ร้านอาหาร', 'คาเฟ่', 'เสริมสวยอื่นๆ', 'ยอดฮิต'];

  const [subFilter, setSubFilter] = useState('ทั้งหมด');
  const SUB_FILTERS = ['ทั้งหมด', 'ร้านอาหาร', 'คาเฟ่', 'เสริมสวยอื่นๆ'];

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

  const handleCategoryChange = (tag: string) => {
    if (tag === activeCategoryTag) return;
    if (tag === 'ยอดฮิต') router.replace('/page/Trending');
    else if (tag === 'ร้านอาหาร') router.replace('/page/Restaurant');
    else if (tag === 'คาเฟ่') router.replace('/page/Cafe');
    else if (tag === 'เสริมสวยอื่นๆ') router.replace('/page/Beauty');
  };

  const processedPlaces = useMemo(() => {
    let result = [...allPlaces];
    
    if (subFilter !== 'ทั้งหมด') {
      result = result.filter((place: Place) => 
        place.category && place.category.includes(subFilter)
      );
    }

    if (searchQuery) {
      result = result.filter((place: Place) => 
        place.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    result.sort((a, b) => (b.weeklyBookings || 0) - (a.weeklyBookings || 0));
    return result;
  }, [allPlaces, searchQuery, subFilter]);

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
        <Text style={styles.headerTitle}>{activeCategoryTag}</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.searchPadding}>
        <View style={styles.searchMinimalWrapper}>
          <Search size={18} color="#A0AEC0" />
          <TextInput 
            style={styles.searchInput}
            placeholder={`ค้นหา${activeCategoryTag}...`}
            placeholderTextColor="#A0AEC0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={{ backgroundColor: '#FFFFFF' }}>
        <CategoryChips tags={FILTER_TAGS} activeTag={activeCategoryTag} onTagPress={handleCategoryChange} showFlameOn="ยอดฮิต" />
      </View>

      <View style={{ backgroundColor: '#FFFFFF', paddingBottom: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
          {SUB_FILTERS.map(tag => (
            <TouchableOpacity
              key={tag}
              onPress={() => setSubFilter(tag)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: subFilter === tag ? '#2D3748' : '#F8FAFC',
                borderWidth: 1,
                borderColor: subFilter === tag ? '#2D3748' : '#EDF2F7',
              }}
            >
              <Text style={{ color: subFilter === tag ? '#FFFFFF' : '#718096', fontSize: 13, fontWeight: '700' }}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={displayedPlaces}
        keyExtractor={(item: Place) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#D69E2E']} tintColor="#D69E2E" />}
        renderItem={({ item, index }) => (
          <View style={{ position: 'relative' }}>
            <Card 
              place={item}
              title={item.name} 
              location={item.branch} 
              distance={typeof item.distance === 'number' ? `${item.distance} กม.` : item.distance} 
              category={item.category} 
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
        ListEmptyComponent={<Text style={styles.emptyText}>ยังไม่มีข้อมูลการจองในหมวดหมู่นี้</Text>}
        onEndReached={loadMorePlaces}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Top 10 {subFilter === 'ทั้งหมด' ? 'สัปดาห์นี้' : subFilter}</Text>
            <Text style={styles.listSubtitle}>จัดอันดับจากยอดการจองสูงสุดในรอบ 7 วันล่าสุด</Text>
          </View>
        }
        ListFooterComponent={() => loadingMore ? <ActivityIndicator size="large" color="#D69E2E" style={{ marginVertical: 20 }} /> : null}
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
  searchInput: { flex: 1, fontSize: 14, color: '#2D3748', marginLeft: 10, height: '100%' },
  listHeader: { marginBottom: 20 },
  listTitle: { fontSize: 20, fontWeight: '900', color: '#2D3748', marginBottom: 4 },
  listSubtitle: { fontSize: 13, color: '#718096' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  emptyText: { textAlign: 'center', color: '#A0AEC0', marginTop: 40, fontSize: 14 },
  rankBadge: { position: 'absolute', top: -10, left: -10, backgroundColor: '#D69E2E', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF', zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  rankText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' }
});