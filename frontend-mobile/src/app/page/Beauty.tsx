import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { toggleSavePlace } from '../../redux/slices/savedPlacesSlice';
import { Card } from '../../components/ui/Card';
import { CategoryChips } from '../../components/ui/CategoryChips';

export default function Beauty() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const activeCategoryTag = 'เสริมสวยอื่นๆ'; 

  const allPlaces = useAppSelector(state => state.places.places);
  const user = useAppSelector((state: any) => state.auth?.user) || { name: 'Taggsh' };
  const savedPlaces = useAppSelector((state: any) => state.savedPlaces?.savedByUser[user.name] || []);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/Home')} style={{ padding: 4 }}><ArrowLeft size={24} color="#1F2937" /></TouchableOpacity>
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
        <CategoryChips 
          tags={[activeCategoryTag, 'กำลังมาแรง']} 
          activeTag={activeCategoryTag} 
          onTagPress={(tag) => { if (tag === 'กำลังมาแรง') router.replace('/page/Trending'); }} 
        />
      </View>

      <FlatList
        data={displayedPlaces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card 
            place={item}
            isSaved={savedPlaces.includes(item.id)}
            onPress={(id) => router.push({ pathname: '/page/PlaceDetail', params: { id } })}
            onSavePress={(id) => dispatch(toggleSavePlace({ username: user.name, placeId: id }))}
          />
        )}
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
  searchMinimalWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', paddingHorizontal: 16, borderRadius: 24, height: 48 }, 
  searchInput: { flex: 1, fontSize: 15, color: '#2D3748', marginLeft: 8, height: '100%' },
  listContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#A0AEC0', fontSize: 16 },
});