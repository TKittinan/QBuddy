import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { toggleSavePlace } from '../../redux/slices/savedPlacesSlice';
import { Card } from '../../components/ui/Card'; // นำเข้า Component Card
import { CategoryChips } from '../../components/ui/CategoryChips'; // นำเข้า Component Chips

export default function Trending() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const allPlaces = useAppSelector(state => state.places.places);
  const user = useAppSelector((state: any) => state.auth?.user) || { name: 'Taggsh' }; 
  const savedPlaces = useAppSelector((state: any) => state.savedPlaces?.savedByUser[user.name] || []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('ทั้งหมด');
  const [displayedCount, setDisplayedCount] = useState(8); 
  const [loadingMore, setLoadingMore] = useState(false);

  const filterTags = ['ทั้งหมด', 'ร้านอาหาร', 'คาเฟ่', 'เสริมสวยอื่นๆ'];

  const processedPlaces = useMemo(() => {
    let result = [...allPlaces];
    if (activeTag !== 'ทั้งหมด') result = result.filter((place: any) => place.tags?.includes(activeTag));
    if (searchQuery) result = result.filter((place: any) => place.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return result.sort((a: any, b: any) => b.monthlyBookings - a.monthlyBookings);
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
        <Text style={styles.headerTitle}>กำลังมาแรง</Text>
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
        keyExtractor={(item) => item.id}
        // เรียกใช้ Card แทนการเขียนโค้ดยาวๆ
        renderItem={({ item }) => (
          <Card 
            place={item}
            isSaved={savedPlaces.includes(item.id)}
            onPress={(id) => router.push({ pathname: '/page/PlaceDetail', params: { id } })}
            onSavePress={(id) => dispatch(toggleSavePlace({ username: user.name, placeId: id }))}
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  searchPadding: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: '#FFFFFF' },
  searchMinimalWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', paddingHorizontal: 16, borderRadius: 24, height: 48 },
  searchInput: { flex: 1, fontSize: 15, color: '#2D3748', marginLeft: 8, height: '100%' },
  listHeader: { marginBottom: 16 },
  listTitle: { fontSize: 16, fontWeight: '800', color: '#2D3748', marginBottom: 4 },
  listSubtitle: { fontSize: 13, color: '#A0AEC0' },
  listContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#A0AEC0', fontSize: 16 },
});