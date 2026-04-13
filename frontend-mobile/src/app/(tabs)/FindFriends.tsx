import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Modal, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Search, MapPin, Plus, Utensils, Coffee, Dumbbell, X, ArrowLeft, LucideIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';

import { useAppSelector } from '../../hooks/useRedux';

const activitySchema = z.object({
  activityDesc: z.string().min(5, { message: 'กรุณาระบุรายละเอียดกิจกรรมอย่างน้อย 5 ตัวอักษร' }),
  selectedQueueId: z.string().min(1, { message: 'กรุณาเลือกคิว/การจองที่คุณต้องการหาเพื่อน' }),
  category: z.string().min(1, { message: 'กรุณาเลือกหมวดหมู่' })
});

type ActivityFormData = z.infer<typeof activitySchema>;

interface NearbyUser {
  id: string;
  name: string;
  activity?: string;
  expireAt?: number;
  timeStr?: string;
  lat: number;
  lng: number;
  avatar?: string;
  image?: string;
  category: string;
  match?: number;
  distanceStr?: string;
  distanceVal?: number;
}

const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); 
};

const mockAiMatches: NearbyUser[] = [
  { id: '1', name: 'กฤษฎา', match: 92, image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400', category: 'ร้านอาหาร', lat: 13.7563, lng: 100.5018 },
  { id: '2', name: 'สุชาวดี', match: 88, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', category: 'คาเฟ่', lat: 13.7600, lng: 100.5100 },
];

const initialNearbyUsers: NearbyUser[] = [
  { id: '101', name: 'พรพิชัย', activity: 'อยากหาเพื่อนไปกินอาหาร', expireAt: Date.now() + 7200000, timeStr: 'วันนี้ 18:00 น.', lat: 13.7550, lng: 100.5050, avatar: 'https://i.pravatar.cc/150?u=1', category: 'ร้านอาหาร' },
  { id: '102', name: 'วิศรุต', activity: 'หาเพื่อนไปนั่งทำงานเงียบๆ', expireAt: Date.now() + 86400000, timeStr: 'พรุ่งนี้ 06:00 น.', lat: 13.7500, lng: 100.5200, avatar: 'https://i.pravatar.cc/150?u=2', category: 'คาเฟ่' },
];

interface FilterChipProps {
  label: string;
  icon: LucideIcon;
}

export default function FindFriendsPage() {
  const router = useRouter();
  const user = useAppSelector(state => state.auth.user);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ร้านอาหาร');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [allNearbyUsers, setAllNearbyUsers] = useState<NearbyUser[]>([]);
  const [joinedActivities, setJoinedActivities] = useState<string[]>([]);

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: { activityDesc: '', selectedQueueId: '', category: 'ร้านอาหาร' },
  });

  useEffect(() => {
    let isMounted = true; 
    let locationSubscription: Location.LocationSubscription | null = null;

    const initDataAndLocation = async () => {
      if (isMounted) setIsLoading(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          if (isMounted) setLocation(currentLocation);
          locationSubscription = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, distanceInterval: 10 },
            (newLoc) => { if (isMounted) setLocation(newLoc); }
          );
        }
      } catch (locError) {}

      try {
        const storedActivitiesStr = await AsyncStorage.getItem('@user_activities');
        const storedActivities = storedActivitiesStr ? (JSON.parse(storedActivitiesStr) as NearbyUser[]) : [];
        const validStoredActivities = storedActivities.filter((act) => act.expireAt && act.expireAt > Date.now());
        
        if (validStoredActivities.length !== storedActivities.length) {
          await AsyncStorage.setItem('@user_activities', JSON.stringify(validStoredActivities));
        }

        if (isMounted) setAllNearbyUsers([...validStoredActivities, ...initialNearbyUsers]);
      } catch (error) {} finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initDataAndLocation();
    return () => { isMounted = false; if (locationSubscription) locationSubscription.remove(); };
  }, []);

  const onSubmitActivity = async (data: ActivityFormData) => {
    try {
      const mockLat = location ? location.coords.latitude : 13.7563;
      const mockLng = location ? location.coords.longitude : 100.5018;
      
      const newActivity: NearbyUser = {
        id: `act_${Date.now()}`, 
        name: user?.name || 'Me', 
        activity: data.activityDesc,
        timeStr: 'วันนี้ (เพิ่งสร้าง)', 
        expireAt: Date.now() + (2 * 60 * 60 * 1000), 
        lat: mockLat, 
        lng: mockLng, 
        avatar: 'https://i.pravatar.cc/150?u=me', 
        category: data.category
      };

      const storedActivitiesStr = await AsyncStorage.getItem('@user_activities');
      const storedActivities = storedActivitiesStr ? (JSON.parse(storedActivitiesStr) as NearbyUser[]) : [];
      storedActivities.unshift(newActivity); 
      await AsyncStorage.setItem('@user_activities', JSON.stringify(storedActivities));
      
      setAllNearbyUsers([...storedActivities, ...initialNearbyUsers]);
      Alert.alert('สำเร็จ', 'ประกาศหากิจกรรมของคุณถูกสร้างเรียบร้อยแล้ว');
      setIsModalVisible(false); reset(); setActiveFilter(data.category);
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกกิจกรรมได้ในขณะนี้');
    }
  };

  const handleJoinPress = (activityId: string, activityName: string) => {
    if (joinedActivities.includes(activityId)) {
      Alert.alert('เปิดแชท', `กำลังเปิดหน้าต่างแชทกับคุณ ${activityName}...`);
    } else {
      setJoinedActivities((prev) => [...prev, activityId]);
      Alert.alert('สำเร็จ', `ส่งคำขอเข้าร่วมกิจกรรมของ ${activityName} แล้ว!`);
    }
  };

  const processUsers = (usersList: NearbyUser[]): NearbyUser[] => {
    return usersList.filter(u => u.category === activeFilter && (u.activity?.includes(searchQuery) || u.name.includes(searchQuery))).map(u => {
        let distanceStr = "ไม่ทราบระยะ"; 
        let distanceVal = 999;
        if (location) { 
          distanceVal = parseFloat(getDistanceInKm(location.coords.latitude, location.coords.longitude, u.lat, u.lng)); 
          distanceStr = `${distanceVal} กม.`; 
        }
        return { ...u, distanceStr, distanceVal };
      }).sort((a, b) => (a.distanceVal || 999) - (b.distanceVal || 999));
  };

  const displayedUsers = processUsers(allNearbyUsers);
  const displayedAi = processUsers(mockAiMatches);

  const FilterChip = ({ label, icon: Icon }: FilterChipProps) => (
    <TouchableOpacity onPress={() => setActiveFilter(label)} className={`flex-row items-center px-4 py-2 rounded-full mr-2 border ${activeFilter === label ? 'bg-[#6FA4A1] border-[#6FA4A1]' : 'bg-white border-gray-200'}`}>
      <Icon size={16} color={activeFilter === label ? '#FFF' : '#4A5568'} className="mr-1.5" />
      <Text className={`text-sm font-semibold ${activeFilter === label ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F7FAFC]">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="px-5 pt-4 pb-2 bg-[#6FA4A1] rounded-b-3xl shadow-sm z-10">
          <View className="flex-row items-center mb-2">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-white">หาเพื่อน</Text>
              <Text className="text-xs text-white opacity-80 mt-0.5">ค้นหาคนที่สนใจเหมือนคุณ</Text>
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="px-5 mt-4">
            <View className="flex-row items-center bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
              <Search size={20} color="#A0AEC0" />
              <TextInput className="flex-1 ml-3 text-base text-gray-800" placeholder="อยากทำกิจกรรมอะไร หรือ ค้นหาชื่อเพื่อน..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#A0AEC0" />
            </View>
          </View>

          <View className="pl-5 mt-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FilterChip label="ร้านอาหาร" icon={Utensils} />
              <FilterChip label="คาเฟ่" icon={Coffee} />
              <FilterChip label="ยิม" icon={Dumbbell} />
            </ScrollView>
          </View>

          <View className="mt-6 pl-5">
            <Text className="text-base font-bold text-gray-800 mb-3">AI แนะนำเพื่อนที่เข้ากันได้ ✨</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {displayedAi.length > 0 ? displayedAi.map((friend) => (
                <View key={friend.id} className="bg-white rounded-2xl w-48 mr-4 shadow-sm border border-gray-100 overflow-hidden pb-4">
                  <View className="relative h-40">
                    <Image source={{ uri: friend.image }} className="w-full h-full" />
                    <View className="absolute top-2 right-2 bg-[#6FA4A1] px-2 py-1 rounded-full flex-row items-center"><Text className="text-white text-xs font-bold">♥ {friend.match}% Match</Text></View>
                  </View>
                  <View className="px-3 pt-3">
                    <Text className="text-base font-bold text-gray-800">{friend.name}</Text>
                    <View className="flex-row items-center mt-1 mb-2"><MapPin size={12} color="#6FA4A1" /><Text className="text-xs text-gray-500 ml-1">{friend.distanceStr}</Text></View>
                    <TouchableOpacity onPress={() => handleJoinPress(friend.id, friend.name)} className={`mt-3 py-2 rounded-lg items-center border ${joinedActivities.includes(friend.id) ? 'bg-white border-[#6FA4A1]' : 'bg-[#6FA4A1] border-transparent'}`}>
                      <Text className={`text-sm font-bold ${joinedActivities.includes(friend.id) ? 'text-[#6FA4A1]' : 'text-white'}`}>{joinedActivities.includes(friend.id) ? '💬 ทักแชท' : 'ขอเข้าร่วม'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )) : <Text className="text-gray-400 italic">ยังไม่มี AI แนะนำในหมวดหมู่นี้</Text>}
            </ScrollView>
          </View>

          <View className="px-5 mt-8 relative">
            <Text className="text-base font-bold text-gray-800 mb-3">คนใกล้เคียง</Text>
            <View className="absolute -top-3 right-5 z-20">
              <TouchableOpacity onPress={() => { setValue('category', activeFilter); setIsModalVisible(true); }} className="flex-row items-center bg-[#6FA4A1] px-4 py-3 rounded-full shadow-lg elevation-5 border-2 border-white">
                <Plus size={18} color="#FFF" />
                <Text className="text-white font-bold ml-2">สร้างกิจกรรมของฉัน</Text>
              </TouchableOpacity>
            </View>

            {displayedUsers.length > 0 ? displayedUsers.map((userObj) => {
              const isJoined = joinedActivities.includes(userObj.id);
              return (
                <View key={userObj.id} className="flex-row bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 items-center">
                  <Image source={{ uri: userObj.avatar }} className="w-14 h-14 rounded-full mr-4" />
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-800">{userObj.name}</Text>
                    <Text className="text-xs text-gray-600 mt-0.5" numberOfLines={2}>{userObj.activity}</Text>
                    <View className="flex-row items-center mt-1.5">
                      <Text className="text-[10px] font-semibold text-[#6FA4A1] bg-teal-50 px-2 py-0.5 rounded mr-2">{userObj.timeStr}</Text>
                      <MapPin size={10} color="#A0AEC0" /><Text className="text-[10px] text-gray-500 ml-1">{userObj.distanceStr}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleJoinPress(userObj.id, userObj.name)} className={`px-4 py-2 rounded-lg ml-2 border ${isJoined ? 'bg-white border-[#6FA4A1]' : 'bg-[#6FA4A1] border-transparent'}`}>
                    <Text className={`text-xs font-bold ${isJoined ? 'text-[#6FA4A1]' : 'text-white'}`}>{isJoined ? '💬 ทักแชท' : 'เข้าร่วม'}</Text>
                  </TouchableOpacity>
                </View>
              );
            }) : <View className="items-center py-6"><Text className="text-gray-400">ยังไม่มีเพื่อนหากิจกรรมในหมวดหมู่นี้</Text></View>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">สร้างกิจกรรมหาเพื่อน</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}><X color="#4A5568" /></TouchableOpacity>
            </View>

            <Text className="text-sm font-bold text-gray-700 mb-2">หมวดหมู่</Text>
            <Controller control={control} name="category" render={({ field: { onChange, value } }) => (
                <View className="flex-row mb-4">
                  {['ร้านอาหาร', 'คาเฟ่', 'ยิม'].map(cat => (
                    <TouchableOpacity key={cat} onPress={() => onChange(cat)} className={`px-3 py-1.5 rounded-full mr-2 border ${value === cat ? 'bg-[#6FA4A1] border-[#6FA4A1]' : 'bg-gray-100 border-gray-200'}`}>
                      <Text className={`text-xs ${value === cat ? 'text-white' : 'text-gray-600'}`}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />

            <Text className="text-sm font-bold text-gray-700 mb-2">เลือกคิว/ร้านที่คุณจองไว้</Text>
            <Controller control={control} name="selectedQueueId" render={({ field: { onChange, value } }) => (
                <View>
                  <TouchableOpacity onPress={() => onChange('Q_123')} className={`border p-4 rounded-xl flex-row items-center justify-between mb-2 ${value === 'Q_123' ? 'border-[#6FA4A1] bg-teal-50' : 'border-gray-300'}`}>
                    <View>
                      <Text className="font-bold text-gray-800">สุกี้ตี๋น้อย (สาขารัชโยธิน)</Text>
                      <Text className="text-xs text-gray-500 mt-1">วันที่ 1/1/69 เวลา 13:50 • คิว A102</Text>
                    </View>
                    {value === 'Q_123' && <Text className="text-[#6FA4A1] font-bold">✓ เลือกแล้ว</Text>}
                  </TouchableOpacity>
                  {errors.selectedQueueId && <Text className="text-red-500 text-xs mt-1 mb-2">{errors.selectedQueueId?.message}</Text>}
                </View>
              )}
            />

            <Text className="text-sm font-bold text-gray-700 mt-4 mb-2">บอกเพื่อนหน่อยว่าอยากได้คนแบบไหน?</Text>
            <Controller control={control} name="activityDesc" render={({ field: { onChange, value } }) => (
                <View>
                  <TextInput className={`border p-4 rounded-xl text-base text-gray-800 h-24 ${errors.activityDesc ? 'border-red-500' : 'border-gray-300'}`} placeholder="เช่น จองโต๊ะ 4 คนไว้ อยากหาเพื่อนกินอีก 2-3 คน หารเท่ากันครับ" multiline textAlignVertical="top" value={value} onChangeText={onChange} />
                  {errors.activityDesc && <Text className="text-red-500 text-xs mt-1">{errors.activityDesc?.message}</Text>}
                </View>
              )}
            />

            <Button title="ประกาศหากิจกรรม" className="mt-6 bg-[#6FA4A1]" onPress={handleSubmit(onSubmitActivity)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}