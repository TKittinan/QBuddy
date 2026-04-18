import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useAppSelector } from '../../redux/useRedux';
import { Card } from '../../components/ui/Card'; 
import { CategoryChips } from '../../components/ui/CategoryChips'; 
import { Place } from '../../types';

export default function Trending() {
  const router = useRouter();
  const allPlaces = useAppSelector(state => state.places.places);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('ทั้งหมด');
  const [displayedCount, setDisplayedCount] = useState(8); 
  const [loadingMore, setLoadingMore] = useState(false);

  const filterTags = ['ทั้งหมด', 'ร้านอาหาร', 'คาเฟ่', 'เสริมสวยอื่นๆ'];

  const processedPlaces = useMemo(() => {
    let result = [...allPlaces];
    if (activeTag !== 'ทั้งหมด') result = result.filter((place: Place) => place.tags?.includes(activeTag));
    if (searchQuery) result = result.filter((place: Place) => place.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // 🌟 ระบุ Type ใน Sort
    return result.sort((a: Place, b: Place) => b.monthlyBookings - a.monthlyBookings);
  }, [searchQuery, activeTag, allPlaces]);

  const displayedPlaces = useMemo(() => processedPlaces.slice(0, displayedCount), [processedPlaces, displayedCount]);

  const loadMorePlaces = useCallback(() => {
    if (loadingMore || displayedCount >= processedPlaces.length) return; 
    setLoadingMore(true);
    setTimeout(() => { setDisplayedCount(prev => prev + 8); setLoadingMore(false); }, 1000); 
  }, [loadingMore, displayedCount, processedPlaces.length]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}><ArrowLeft size={24} color="#1F2937" /></TouchableOpacity>
        <Text style={styles.headerTitle}>กำลังมาแรง 🔥</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchPadding}>
        <View style={styles.searchMinimalWrapper}>
          <Search size={20} color="#A0AEC0" />
          <TextInput style={styles.searchInput} placeholder="ค้นหาร้านฮิต..." placeholderTextColor="#A0AEC0" value={searchQuery} onChangeText={setSearchQuery} />
        </View>
      </View>

      <View>
        <CategoryChips 
          tags={filterTags} 
          activeTag={activeTag} 
          onTagPress={setActiveTag} 
          showFlameOn="ทั้งหมด"
        />
      </View>

      <FlatList
        data={displayedPlaces}
        keyExtractor={(item: Place) => item.id}
        renderItem={({ item }: { item: Place }) => (
          <Card 
            place={item}
            onPress={(id: string) => router.push({ pathname: '/page/PlaceDetail', params: { id } })}
            showBookingBadge={true}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>ไม่พบร้านที่คุณค้นหา</Text>}
        onEndReached={loadMorePlaces}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>ร้านยอดฮิตประจำเดือน!</Text>
            <Text style={styles.listSubtitle}>จัดอันดับจากยอดการจองสำเร็จสูงสุดในรอบ 30 วัน</Text>
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
  listHeader: { marginBottom: 16 },
  listTitle: { fontSize: 16, fontWeight: '800', color: '#2D3748', marginBottom: 4 },
  listSubtitle: { fontSize: 13, color: '#A0AEC0' },
  listContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#A0AEC0', fontSize: 16 },
});