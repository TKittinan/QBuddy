import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Platform, StatusBar, FlatList, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { ArrowLeft, MapPin, Search, Flame } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../../hooks/useRedux';

export default function Beauty() {
  const router = useRouter();
  const activeCategoryTag = 'เสริมสวยอื่นๆ'; 

  const allPlaces = useAppSelector(state => state.places.places);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedCount, setDisplayedCount] = useState(10); 
  const [loadingMore, setLoadingMore] = useState(false);

  const filteredPlaces = useMemo(() => {
    const basePlaces = allPlaces.filter((place: any) => place.tags?.includes(activeCategoryTag));

    if (!searchQuery) return basePlaces;
    
    return basePlaces.filter((place: any) => 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.tags?.some((tag: string) => tag.includes(searchQuery))
    );
  }, [searchQuery, allPlaces]);

  const displayedPlaces = useMemo(() => filteredPlaces.slice(0, displayedCount), [filteredPlaces, displayedCount]);

  const loadMorePlaces = useCallback(() => {
    if (loadingMore || displayedCount >= filteredPlaces.length) return;
    setLoadingMore(true);
    setTimeout(() => { setDisplayedCount(prev => prev + 10); setLoadingMore(false); }, 1000); 
  }, [loadingMore, displayedCount, filteredPlaces.length]);

  const handleViewDetail = (id: string) => {
    router.push({
      pathname: '/page/PlaceDetail',
      params: { id }
    });
  };

  const goBackHome = () => router.replace('/(tabs)/Home');
  const goToTrending = () => router.replace('/page/Trending'); 

  const renderPlaceCard = ({ item: place }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => handleViewDetail(place.id)}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: place.image }} style={styles.cardImage} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.placeName}>{place.name}</Text>
        <View style={styles.infoRow}>
          <MapPin size={14} color="#6FA4A1" style={{ marginRight: 4 }} />
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
        <TouchableOpacity onPress={goBackHome} style={{ padding: 4 }}><ArrowLeft size={24} color="#1F2937" /></TouchableOpacity>
        <Text style={styles.headerTitle}>{activeCategoryTag}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchPadding}>
        <View style={styles.searchMinimalWrapper}>
          <Search size={20} color="#A0AEC0" />
          <TextInput style={styles.searchInput} placeholder={`ค้นหาในหมวด ${activeCategoryTag}...`} placeholderTextColor="#A0AEC0" value={searchQuery} onChangeText={setSearchQuery} />
        </View>
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <TouchableOpacity style={styles.chipActive}>
            <MapPin size={14} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.chipTextActive}>{activeCategoryTag}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chipInactive} onPress={goToTrending}>
            <Flame size={14} color="#4A5568" style={{ marginRight: 6 }} />
            <Text style={styles.chipTextInactive}>กำลังมาแรง</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={displayedPlaces}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaceCard}
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

// 🌟 สไตล์ใช้ร่วมกันกับ Restaurant
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, backgroundColor: '#FFFFFF' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  searchPadding: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10, backgroundColor: '#FFFFFF' },
  searchMinimalWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', paddingHorizontal: 16, borderRadius: 24, height: 48 }, 
  searchInput: { flex: 1, fontSize: 15, color: '#2D3748', marginLeft: 8, height: '100%' },
  chipScroll: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 4, backgroundColor: '#FFFFFF' },
  chipActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6FA4A1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, marginRight: 10 },
  chipTextActive: { fontSize: 14, color: '#FFFFFF', fontWeight: '700' },
  chipInactive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, marginRight: 10, borderWidth: 1, borderColor: '#EDF2F7' },
  chipTextInactive: { fontSize: 14, color: '#4A5568', fontWeight: '600' },
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