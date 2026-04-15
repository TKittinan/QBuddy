import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Platform, StatusBar, FlatList, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { ArrowLeft, MapPin, Flame, Search, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../../hooks/useRedux';

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

    if (activeTag !== 'ทั้งหมด') {
      result = result.filter((place: any) => place.tags?.includes(activeTag));
    }

    if (searchQuery) {
      result = result.filter((place: any) => place.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    
    return result.sort((a: any, b: any) => b.monthlyBookings - a.monthlyBookings);
  }, [searchQuery, activeTag, allPlaces]);

  const displayedPlaces = useMemo(() => processedPlaces.slice(0, displayedCount), [processedPlaces, displayedCount]);

  const loadMorePlaces = useCallback(() => {
    if (loadingMore || displayedCount >= processedPlaces.length) return; 
    setLoadingMore(true);
    setTimeout(() => { setDisplayedCount(prev => prev + 8); setLoadingMore(false); }, 1000); 
  }, [loadingMore, displayedCount, processedPlaces.length]);

  const handleViewDetail = (id: string) => {
    router.push({
      pathname: '/page/PlaceDetail',
      params: { id }
    });
  };

  const renderTrendCard = ({ item: place }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => handleViewDetail(place.id)}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: place.image }} style={styles.cardImage} />
        <View style={styles.bookingBadge}>
          <Users size={12} color="#FFF" style={{ marginRight: 4 }} />
          <Text style={styles.bookingBadgeText}>{place.monthlyBookings.toLocaleString()} จองเดือนนี้</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.placeName}>{place.name}</Text>
        <View style={styles.infoRow}>
          <MapPin size={14} color="#DD6B20" style={{ marginRight: 4 }} />
          <Text style={styles.distanceText}>{place.distance}</Text>
        </View>
        <View style={styles.tagsRow}>
          {place.tags?.map((tag: string, idx: number) => (
            <Text key={idx} style={styles.tagText}>{tag}{idx < place.tags.length - 1 ? '    ' : ''}</Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {filterTags.map((tag) => (
            <TouchableOpacity 
              key={tag}
              style={activeTag === tag ? styles.chipActive : styles.chipInactive} 
              onPress={() => setActiveTag(tag)}
            >
              {activeTag === tag ? <Flame size={14} color="#FFFFFF" style={{ marginRight: 6 }} /> : null}
              <Text style={activeTag === tag ? styles.chipTextActive : styles.chipTextInactive}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={displayedPlaces}
        keyExtractor={(item) => item.id}
        renderItem={renderTrendCard}
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
  chipScroll: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 4, backgroundColor: '#FFFFFF' },
  chipActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DD6B20', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, marginRight: 10 },
  chipTextActive: { fontSize: 14, color: '#FFFFFF', fontWeight: '700' },
  chipInactive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, marginRight: 10, borderWidth: 1, borderColor: '#EDF2F7' },
  chipTextInactive: { fontSize: 14, color: '#4A5568', fontWeight: '600' },
  listHeader: { marginBottom: 16 },
  listTitle: { fontSize: 16, fontWeight: '800', color: '#2D3748', marginBottom: 4 },
  listSubtitle: { fontSize: 13, color: '#A0AEC0' },
  listContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 20, shadowColor: '#DD6B20', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#FFF5F5' },
  imageWrapper: { width: '100%', height: 160, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%' },
  bookingBadge: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#DD6B20', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  bookingBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  cardContent: { padding: 16 },
  placeName: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  distanceText: { fontSize: 13, color: '#718096' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tagText: { fontSize: 13, color: '#DD6B20', fontWeight: '500', marginBottom: 4 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#A0AEC0', fontSize: 16 },
});