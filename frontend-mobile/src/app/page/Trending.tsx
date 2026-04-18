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
  
  const placesState = useAppSelector((state: any) => state.places);
  const rawPlaces = placesState?.places?.data || placesState?.places || [];
  const allPlaces = Array.isArray(rawPlaces) ? rawPlaces : [];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('ทั้งหมด');
  const [displayedCount, setDisplayedCount] = useState(8); 
  const [loadingMore, setLoadingMore] = useState(false);

  const filterTags = ['ทั้งหมด', 'ร้านอาหาร', 'คาเฟ่', 'เสริมสวยอื่นๆ'];

  const processedPlaces = useMemo(() => {
    let result = [...allPlaces];
    // 🌟 แก้ให้เช็ค category ตรงๆ 
    if (activeTag !== 'ทั้งหมด') result = result.filter((place: Place) => place.category === activeTag);
    if (searchQuery) result = result.filter((place: Place) => place.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return result.sort((a: Place, b: Place) => (b.monthlyBookings || 0) - (a.monthlyBookings || 0));
  }, [allPlaces, activeTag, searchQuery]);

  const displayedPlaces = useMemo(() => {
    return processedPlaces.slice(0, displayedCount);
  }, [processedPlaces, displayedCount]);

  const loadMorePlaces = useCallback(() => {
    if (displayedCount < processedPlaces.length && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setDisplayedCount(prev => prev + 8);
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
        renderItem={({ item, index }) => (
          <View style={{ position: 'relative' }}>
            <Card 
              title={item.name} 
              imageUri={item.image} 
              location={item.branch} 
              distance={typeof item.distance === 'number' ? `${item.distance} กม.` : item.distance} 
              category={item.category} // 🌟 ส่ง category เข้า Component 
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
        ListEmptyComponent={<Text style={styles.emptyText}>ไม่พบข้อมูลร้านยอดฮิต</Text>}
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
  listHeader: { marginBottom: 20 },
  listTitle: { fontSize: 20, fontWeight: '900', color: '#2D3748', marginBottom: 4 },
  listSubtitle: { fontSize: 13, color: '#718096' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  emptyText: { textAlign: 'center', color: '#A0AEC0', marginTop: 40, fontSize: 14 },
  rankBadge: { position: 'absolute', top: -10, left: -10, backgroundColor: '#DD6B20', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF', zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  rankText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' }
});