import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Modal, Alert, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Search, MapPin, Plus, Utensils, Coffee, Dumbbell, X, ArrowLeft } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';

// 🌟 ดึงข้อมูลจาก Redux
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { addActivity, joinActivity } from '../../redux/slices/friendSlice';

const activitySchema = z.object({
  activityDesc: z.string().min(5, 'กรุณาระบุรายละเอียดอย่างน้อย 5 ตัวอักษร'),
  selectedQueueId: z.string().min(1, 'กรุณาเลือกคิว/การจอง'),
  category: z.string().min(1, 'กรุณาเลือกหมวดหมู่')
});

type ActivityFormData = z.infer<typeof activitySchema>;

export default function FindFriendsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: any) => state.auth?.user);
  
  // 🌟 แก้ไข: เติม s เป็น state.friends และใส่ (state: any) เพื่อแก้ TS Error
  const { nearbyUsers: allNearbyUsers = [], aiMatches: mockAiMatches = [], joinedActivities = [] } = useAppSelector((state: any) => state.friends || {});

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ร้านอาหาร');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: { activityDesc: '', selectedQueueId: '', category: 'ร้านอาหาร' },
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
    })();
  }, []);

  const onSubmitActivity = (data: ActivityFormData) => {
    const newActivity = {
      id: `act_${Date.now()}`, 
      name: user?.name || 'Me', 
      activity: data.activityDesc,
      timeStr: 'วันนี้ (เพิ่งสร้าง)', 
      expireAt: Date.now() + (2 * 60 * 60 * 1000), 
      lat: location ? location.coords.latitude : 13.7563, 
      lng: location ? location.coords.longitude : 100.5018, 
      avatar: 'https://i.pravatar.cc/150?u=me', 
      category: data.category
    };
    dispatch(addActivity(newActivity)); // 🌟 ส่งเข้า Redux
    Alert.alert('สำเร็จ', 'ประกาศหากิจกรรมของคุณถูกสร้างเรียบร้อยแล้ว');
    setIsModalVisible(false); reset(); setActiveFilter(data.category);
  };

  const handleJoinPress = (activityId: string, activityName: string) => {
    if (joinedActivities.includes(activityId)) {
      Alert.alert('เปิดแชท', `กำลังเปิดหน้าต่างแชทกับคุณ ${activityName}...`);
    } else {
      dispatch(joinActivity(activityId)); // 🌟 บันทึกการเข้าร่วมเข้า Redux
      Alert.alert('สำเร็จ', `ส่งคำขอเข้าร่วมกิจกรรมของ ${activityName} แล้ว!`);
    }
  };

  const processUsers = (usersList: any[]) => usersList.filter(u => u.category === activeFilter && (u.activity?.includes(searchQuery) || u.name.includes(searchQuery)));
  const displayedUsers = processUsers(allNearbyUsers);
  const displayedAi = processUsers(mockAiMatches);

  return (
    <SafeAreaView className="flex-1 bg-[#F7FAFC]">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="px-5 pb-4 bg-[#6FA4A1] rounded-b-3xl shadow-sm z-10" style={{ paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16 }}>
          <View className="flex-row items-center mb-2">
            <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1"><ArrowLeft size={24} color="#FFFFFF" /></TouchableOpacity>
            <View><Text className="text-xl font-bold text-white">หาเพื่อน</Text><Text className="text-xs text-white opacity-80 mt-0.5">ค้นหาคนที่สนใจเหมือนคุณ</Text></View>
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
              {['ร้านอาหาร', 'คาเฟ่', 'ยิม'].map(cat => (
                 <TouchableOpacity key={cat} onPress={() => setActiveFilter(cat)} className={`flex-row items-center px-4 py-2 rounded-full mr-2 border ${activeFilter === cat ? 'bg-[#6FA4A1] border-[#6FA4A1]' : 'bg-white border-gray-200'}`}>
                   <Text className={`text-sm font-semibold ${activeFilter === cat ? 'text-white' : 'text-gray-700'}`}>{cat}</Text>
                 </TouchableOpacity>
              ))}
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
                <Text className="text-white font-bold ml-2">สร้างกิจกรรม</Text>
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
            <Button title="ประกาศหากิจกรรม" className="mt-6 bg-[#6FA4A1]" onPress={handleSubmit(onSubmitActivity)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}