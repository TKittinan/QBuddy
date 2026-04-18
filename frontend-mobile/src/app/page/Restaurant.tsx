import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useAppSelector } from '../../redux/useRedux';
import { Card } from '../../components/ui/Card';
import { Place } from '../../types';

interface LocalRootState {
  places: { places: Place[] | { data: Place[] } };
}

export default function Restaurant() { 
  const router = useRouter();
  const activeCategoryTag = 'ร้านอาหาร'; 

  const rawPlaces = useAppSelector((state: LocalRootState) => state.places.places);
  const allPlaces = Array.isArray(rawPlaces) ? rawPlaces : [];

  const [searchQuery, setSearchQuery] = useState('');
  const [displayedCount, setDisplayedCount] = useState(10); 
  const [loadingMore, setLoadingMore] = useState(false);

  const filteredPlaces = useMemo(() => {
    // 🌟 แก้ไขให้เช็คจาก category ตรงๆ
    const basePlaces = allPlaces.filter((place: Place) => place.category === activeCategoryTag);
    if (!searchQuery) return basePlaces;
    return basePlaces.filter((place: Place) => 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPlaces, searchQuery, activeCategoryTag]);

  const displayedPlaces = useMemo(() => {
    return filteredPlaces.slice(0, displayedCount);
  }, [filteredPlaces, displayedCount]);

  const loadMorePlaces = useCallback(() => {
    if (displayedCount < filteredPlaces.length && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setDisplayedCount(prev => prev + 10);
        setLoadingMore(false);
      }, 500); 
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
          <TextInput 
            style={styles.searchInput}
            placeholder={`ค้นหา${activeCategoryTag}...`}
            placeholderTextColor="#A0AEC0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={displayedPlaces}
        keyExtractor={(item: Place) => item.id}
        renderItem={({ item }) => (
          <Card 
            title={item.name} 
            imageUri={item.image} 
            location={item.branch} 
            distance={typeof item.distance === 'number' ? `${item.distance} กม.` : item.distance} 
            category={item.category} // 🌟 ส่ง category เข้า Component แทน tags
            onPress={(id: string) => router.push({ pathname: '/page/PlaceDetail', params: { id } })}
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
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#2D3748', height: '100%' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 10 },
  emptyText: { textAlign: 'center', color: '#A0AEC0', marginTop: 40, fontSize: 14 }
});