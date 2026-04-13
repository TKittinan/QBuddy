import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Sparkles, Map, Star, ArrowLeft, LucideIcon } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

interface MockPlace { id: string; name: string; category: string; type: string; rating: number; waitTime: string; status: 'busy' | 'available'; image: string; lat: number; lng: number; }
const MOCK_PLACES: MockPlace[] = [ { id: '1', name: 'ชาบูชิ', category: 'บุฟเฟต์', type: 'buffet', rating: 4.5, waitTime: 'รอคิว 15 นาที', status: 'busy', image: 'https://images.unsplash.com/photo-1526462153549-36224314cfa8?w=200', lat: 13.75, lng: 100.51 } ];

export default function SmartFeedPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ai' | 'nearby' | 'rating'>('ai');
  const [places, setPlaces] = useState<MockPlace[]>(MOCK_PLACES);

  const handleNearbyTab = async () => {
    setActiveTab('nearby');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('เตือน', 'ต้องการ GPS');
    try { await Location.getCurrentPositionAsync({}); } catch (e) {}
  };

  const TabBtn = ({ id, label, icon: Icon }: { id: 'ai' | 'nearby' | 'rating'; label: string; icon: LucideIcon }) => (
    <TouchableOpacity onPress={() => id === 'nearby' ? handleNearbyTab() : setActiveTab(id)} className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${activeTab === id ? 'bg-[#6FA4A1]' : 'bg-gray-100'}`}>
      <Icon size={16} color={activeTab === id ? '#FFF' : '#6B7280'} className="mr-2" /><Text className={`text-sm font-bold ${activeTab === id ? 'text-white' : 'text-gray-600'}`}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F7FAFC]">
      <View 
        className="px-5 pb-4 flex-row items-center justify-between bg-white shadow-sm z-10"
        style={{ paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16 }}
      >
        <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#1F2937" /></TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Smart Feed</Text>
        <Sparkles size={24} color="#374151" />
      </View>
      <View className="px-5 py-3 bg-white border-b border-gray-100 flex-row"><TabBtn id="ai" label="AI แนะนำ" icon={Sparkles} /><TabBtn id="nearby" label="ใกล้ฉัน" icon={Map} /><TabBtn id="rating" label="คะแนนสูง" icon={Star} /></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        {places.map((place) => (
          <View key={place.id} className="bg-white rounded-2xl p-3 mb-3 shadow-sm border border-gray-100 flex-row items-center relative">
            <Image source={{ uri: place.image }} className="w-20 h-20 rounded-full mr-4 border border-gray-200" />
            <View className="flex-1"><Text className="font-bold text-gray-800 mb-0.5">{place.name}</Text><Text className="text-xs text-gray-500">{place.category}</Text></View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}