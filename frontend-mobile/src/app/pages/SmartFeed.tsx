// src/app/pages/SmartFeed.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Sparkles, Map, Star, Clock, CheckCircle2, Bookmark } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// Import Layout ที่เราเพิ่งสร้าง
import { SmartFeedLayout } from '../../layouts/SmartFeedLayout';

// --- MOCK DATA: ฐานข้อมูลร้านค้าทั้งหมด ---
const MOCK_PLACES = [
  { id: '1', name: 'ชาบูชิ (Shabushi)', category: 'บุฟเฟต์ชาบูสายพาน', type: 'buffet', rating: 4.5, waitTime: 'รอคิว 15 นาที', status: 'busy', image: 'https://images.unsplash.com/photo-1526462153549-36224314cfa8?w=200', lat: 13.75, lng: 100.51 },
  { id: '2', name: 'เอ็มเค สุกี้ (MK...)', category: 'สุกี้เพื่อสุขภาพ', type: 'suki', rating: 4.8, waitTime: 'ว่าง (ไม่ต้องรอ)', status: 'available', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200', lat: 13.76, lng: 100.52 },
  { id: '3', name: 'บาร์บีคิวพลาซ่า (Bar-B-Q)', category: 'ปิ้งย่างกระทะทองเหลือง', type: 'grill', rating: 4.6, waitTime: 'รอคิว 45 นาที', status: 'busy', image: 'https://images.unsplash.com/photo-1544025162-817865c192fa?w=200', lat: 13.74, lng: 100.53 },
  { id: '4', name: 'ซูชิ ฮิโระ (Sushi Hiro)', category: 'อาหารญี่ปุ่นพรีเมียม', type: 'japanese', rating: 4.9, waitTime: 'รอคิว 60 นาที', status: 'busy', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200', lat: 13.77, lng: 100.54 },
  { id: '5', name: 'ส้มตำนัว (Som Tam Nua)', category: 'อาหารอีสานรสเด็ด', type: 'isan', rating: 4.2, waitTime: 'ว่าง 2 โต๊ะ', status: 'available', image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=200', lat: 13.73, lng: 100.50 },
  { id: '6', name: 'อุทยานแห่งชาติเขาใหญ่', category: 'ท่องเที่ยว/อุทยาน', type: 'park', rating: 4.7, waitTime: 'เปิดทำการ', status: 'available', image: 'https://images.unsplash.com/photo-1582293041079-7814c2b12063?w=200', lat: 14.43, lng: 101.37 },
  { id: '7', name: 'Cafe Amazon', category: 'คาเฟ่/กาแฟ', type: 'cafe', rating: 4.1, waitTime: 'ว่าง', status: 'available', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200', lat: 13.755, lng: 100.515 },
];

const MOCK_USER_HISTORY = ['buffet', 'buffet', 'buffet', 'buffet', 'buffet', 'suki', 'suki', 'suki', 'grill', 'grill', 'cafe'];

export default function SmartFeedPage() {
  const [activeTab, setActiveTab] = useState<'ai' | 'nearby' | 'rating'>('ai');
  const [aiPlaces, setAiPlaces] = useState<any[]>([]);
  const [recommendedPlaces, setRecommendedPlaces] = useState<any[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [highRatingPlaces, setHighRatingPlaces] = useState<any[]>([]);

  useEffect(() => {
    const loadAndAnalyzeData = async () => {
      const historyStr = await AsyncStorage.getItem('@user_booking_history');
      const history = historyStr ? JSON.parse(historyStr) : MOCK_USER_HISTORY;

      const frequency: { [key: string]: number } = {};
      history.forEach((type: string) => {
        frequency[type] = (frequency[type] || 0) + 1;
      });

      const topCategories = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0]);

      const top3Places = topCategories.map(type => 
        MOCK_PLACES.find(p => p.type === type)
      ).filter(Boolean);
      
      setAiPlaces(top3Places);

      const otherPlaces = MOCK_PLACES.filter(p => !topCategories.includes(p.type)).slice(0, 2);
      setRecommendedPlaces(otherPlaces.length === 2 ? otherPlaces : [MOCK_PLACES[3], MOCK_PLACES[4]]);

      setHighRatingPlaces(MOCK_PLACES.filter(p => p.rating > 4.5).sort((a, b) => b.rating - a.rating));
      setNearbyPlaces(MOCK_PLACES); 

      /*
      // ==============================================================
      //  FUTURE API INTEGRATION (รอต่อ Database ลูกค้า)
      // ==============================================================
      // const historyRes = await axios.get(`/api/bookings/history/${user.id}`);
      // const aiRecommendation = await axios.post('/api/ai/recommend', { history: historyRes.data, limitTop: 3, limitRecommended: 2 });
      // setAiPlaces(aiRecommendation.data.topPlaces);
      // setRecommendedPlaces(aiRecommendation.data.recommendedForYou);
      // const highRatingRes = await axios.get('/api/places?minRating=4.5&sortBy=rating_desc');
      // setHighRatingPlaces(highRatingRes.data);
      */
    };

    loadAndAnalyzeData();
  }, []);

  const handleNearbyTab = async () => {
    setActiveTab('nearby');
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('ต้องใช้ตำแหน่งที่ตั้ง', 'แอปจำเป็นต้องเข้าถึง GPS เพื่อค้นหาร้านใกล้คุณ', [{ text: 'ตกลง' }]);
      return;
    }
    try {
      await Location.getCurrentPositionAsync({});
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถดึงตำแหน่งปัจจุบันได้ กรุณาตรวจสอบว่าเปิด GPS หรือยัง');
    }
  };

  const TabButton = ({ id, label, icon: Icon }: any) => {
    const isActive = activeTab === id;
    return (
      <TouchableOpacity 
        onPress={() => id === 'nearby' ? handleNearbyTab() : setActiveTab(id)}
        className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${isActive ? 'bg-[#6FA4A1]' : 'bg-gray-100'}`}
      >
        <Icon size={16} color={isActive ? '#FFF' : '#6B7280'} className="mr-2" />
        <Text className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-600'}`}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const PlaceCard = ({ place }: any) => (
    <View className="bg-white rounded-2xl p-3 mb-3 shadow-sm border border-gray-100 flex-row items-center relative">
      <Image source={{ uri: place.image }} className="w-20 h-20 rounded-full mr-4 border border-gray-200" />
      <View className="flex-1">
        <View className="flex-row justify-between items-start">
          <Text className="text-base font-bold text-gray-800 mb-0.5 w-4/5" numberOfLines={1}>{place.name}</Text>
          <View className="flex-row items-center bg-yellow-50 px-1.5 py-0.5 rounded">
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text className="text-xs font-bold text-yellow-600 ml-1">{place.rating}</Text>
          </View>
        </View>
        <Text className="text-xs text-gray-500 mb-2">{place.category} •</Text>
        
        <View className={`flex-row items-center px-2 py-1 rounded w-32 ${place.status === 'busy' ? 'bg-red-50' : 'bg-green-50'}`}>
          {place.status === 'busy' ? <Clock size={12} color="#EF4444" /> : <CheckCircle2 size={12} color="#10B981" />}
          <Text className={`text-xs font-bold ml-1.5 ${place.status === 'busy' ? 'text-red-500' : 'text-green-500'}`}>
            {place.waitTime}
          </Text>
        </View>
      </View>
      <TouchableOpacity className="absolute bottom-3 right-3 bg-gray-100 p-1.5 rounded-full">
        <Bookmark size={18} color="#6FA4A1" />
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (activeTab === 'ai') {
      return (
        <View className="px-5 pb-4 pt-2">
          <View className="flex-row items-center mb-3 mt-4">
            <Sparkles size={16} color="#6FA4A1" />
            <Text className="text-sm font-bold text-[#6FA4A1] ml-2">คล้ายกับร้านที่คุณเคยไป</Text>
          </View>
          {aiPlaces.map((place, index) => <PlaceCard key={`ai-${index}`} place={place} />)}

          <View className="flex-row items-center mb-3 mt-4">
            <Sparkles size={16} color="#6FA4A1" />
            <Text className="text-sm font-bold text-[#6FA4A1] ml-2">เหมาะสำหรับมื้อเย็นของคุณ</Text>
          </View>
          {recommendedPlaces.map((place, index) => <PlaceCard key={`rec-${index}`} place={place} />)}
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 16 }}>
        {activeTab === 'nearby' && nearbyPlaces.map(place => <PlaceCard key={`near-${place.id}`} place={place} />)}
        {activeTab === 'rating' && highRatingPlaces.map(place => <PlaceCard key={`rate-${place.id}`} place={place} />)}
      </ScrollView>
    );
  };

  return (
    <SmartFeedLayout>
      {/* Tabs */}
      <View className="px-5 py-3 bg-white border-b border-gray-100 flex-row">
        <TabButton id="ai" label="AI แนะนำ" icon={Sparkles} />
        <TabButton id="nearby" label="ใกล้ฉัน" icon={Map} />
        <TabButton id="rating" label="คะแนนสูง" icon={Star} />
      </View>

      {/* Content Area */}
      <View className="flex-1 bg-[#F7FAFC]">
        {renderContent()}
      </View>
    </SmartFeedLayout>
  );
}