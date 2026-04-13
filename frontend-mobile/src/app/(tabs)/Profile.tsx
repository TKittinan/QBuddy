import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, TextInput, Alert, Switch, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Camera, Brain, Shield, Bookmark, Settings, Clock, LogOut, ChevronRight, X, ArrowLeft, LucideIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination'; 
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout } from '../../redux/slices/authSlice';

interface SavedPlace { id: string; name: string; category: string; rating: number; image: string; distance: string; }

const MOCK_SAVED_PLACES: SavedPlace[] = [
  { id: '1', name: 'ชาบูชิ (Shabushi)', category: 'บุฟเฟต์', rating: 4.5, image: 'https://images.unsplash.com/photo-1526462153549-36224314cfa8?w=200', distance: '1.2 กม.' },
  { id: '2', name: 'เอ็มเค สุกี้ (MK)', category: 'สุกี้', rating: 4.8, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200', distance: '2.0 กม.' },
];

interface MenuItemProps { icon: LucideIcon; title: string; subtitle: string; onPress: () => void; }

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [userName, setUserName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');

  const [modals, setModals] = useState({ edit: false, ai: false, privacy: false, saved: false, general: false });
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [unsavedIds, setUnsavedIds] = useState<string[]>([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(savedPlaces.length / ITEMS_PER_PAGE);
  const [settings, setSettings] = useState({ notifications: true, location: true });

  useEffect(() => {
    const loadProfileData = async () => {
      const storedAvatar = await AsyncStorage.getItem('@user_avatar');
      if (storedAvatar) setAvatarUri(storedAvatar);

      const storedPlacesStr = await AsyncStorage.getItem('@saved_places');
      if (storedPlacesStr) {
        setSavedPlaces(JSON.parse(storedPlacesStr) as SavedPlace[]);
      } else {
        setSavedPlaces(MOCK_SAVED_PLACES); 
        await AsyncStorage.setItem('@saved_places', JSON.stringify(MOCK_SAVED_PLACES));
      }
    };
    loadProfileData();
  }, []);

  const openModal = (key: keyof typeof modals) => {
    if (key === 'saved') {
      const filtered = savedPlaces.filter(p => !unsavedIds.includes(p.id));
      setSavedPlaces(filtered); setUnsavedIds([]); setCurrentPage(1);
    }
    setModals({ ...modals, [key]: true });
  };
  const closeModal = (key: keyof typeof modals) => setModals({ ...modals, [key]: false });

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('ขออภัย', 'แอปจำเป็นต้องเข้าถึงคลังรูปภาพเพื่อเปลี่ยนรูปโปรไฟล์');
    
    const result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, 
      aspect: [1, 1], 
      quality: 0.8 
    });

    if (!result.canceled) {
      const newImageUri = result.assets[0].uri;
      setAvatarUri(newImageUri);
      await AsyncStorage.setItem('@user_avatar', newImageUri);
    }
  };

  const handleSaveProfile = () => {
    Alert.alert('สำเร็จ', 'อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว');
    closeModal('edit');
  };

  const toggleSavePlace = async (id: string) => {
    let newUnsaved = [...unsavedIds];
    if (newUnsaved.includes(id)) newUnsaved = newUnsaved.filter(item => item !== id); else newUnsaved.push(id);
    setUnsavedIds(newUnsaved);
    const actualSaved = savedPlaces.filter(p => !newUnsaved.includes(p.id));
    await AsyncStorage.setItem('@saved_places', JSON.stringify(actualSaved));
  };

  const handleLogout = () => {
    Alert.alert('ยืนยันออกจากระบบ', 'คุณต้องการออกจากระบบใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ออกจากระบบ', style: 'destructive', onPress: () => dispatch(logout()) }
    ]);
  };

  const MenuItem = ({ icon: Icon, title, subtitle, onPress }: MenuItemProps) => (
    <TouchableOpacity onPress={onPress} className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100">
      <View className="bg-slate-50 p-2.5 rounded-full mr-4"><Icon size={22} color="#475569" /></View>
      <View className="flex-1"><Text className="text-base font-bold text-gray-800">{title}</Text><Text className="text-xs text-gray-500 mt-0.5">{subtitle}</Text></View>
      <ChevronRight size={20} color="#CBD5E0" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F7FAFC]">
      <View 
        className="px-5 pb-4 flex-row items-center justify-between bg-white shadow-sm z-10"
        style={{ paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16 }}
      >
        <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#1F2937" /></TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Profile & Settings</Text>
        <TouchableOpacity onPress={() => openModal('edit')}><Text className="text-base font-bold text-[#6FA4A1]">Edit</Text></TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="items-center mt-8 mb-6">
          <View className="relative">
            <Image source={{ uri: avatarUri || 'https://i.pravatar.cc/150?u=a042581f4e29026024d' }} className="w-28 h-28 rounded-full border-4 border-white shadow-sm" />
            <TouchableOpacity onPress={handlePickImage} className="absolute bottom-0 right-0 bg-[#6FA4A1] p-2 rounded-full border-2 border-white shadow-md"><Camera size={16} color="#FFF" /></TouchableOpacity>
          </View>
          <Text className="text-2xl font-extrabold text-gray-800 mt-4">{userName}</Text>
          <Text className="text-sm text-gray-500 mt-1">queue.ai/u/{userName.toLowerCase().replace(/\s/g, '')}</Text>
        </View>

        <View className="px-5">
          <MenuItem icon={Brain} title="AI Preferences" subtitle="Manage recommendation logic" onPress={() => openModal('ai')} />
          <MenuItem icon={Shield} title="Privacy & Data Usage" subtitle="Control what AI sees" onPress={() => openModal('privacy')} />
          <MenuItem icon={Bookmark} title="Saved Places" subtitle="Your favorite locations" onPress={() => openModal('saved')} />
          <MenuItem icon={Settings} title="General Settings" subtitle="Notifications, Language" onPress={() => openModal('general')} />
          <MenuItem icon={Clock} title="History" subtitle="Latest booking" onPress={() => {}} />

          <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center bg-white py-4 rounded-2xl mt-4 border border-gray-200 shadow-sm">
            <LogOut size={20} color="#475569" className="mr-2" />
            <Text className="text-base font-bold text-gray-700">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <Modal visible={modals.edit} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Edit Profile</Text>
              <TouchableOpacity onPress={() => closeModal('edit')}><X color="#4A5568" /></TouchableOpacity>
            </View>
            <Text className="text-sm font-bold text-gray-700 mb-2">ชื่อ - นามสกุล</Text>
            <TextInput className="border border-gray-300 p-4 rounded-xl text-base text-gray-800 mb-4" value={userName} onChangeText={setUserName} />
            <Text className="text-sm font-bold text-gray-700 mb-2">อีเมล</Text>
            <TextInput className="border border-gray-300 p-4 rounded-xl text-base text-gray-800 mb-6" value={userEmail} onChangeText={setUserEmail} keyboardType="email-address" />
            <Button title="บันทึกข้อมูล" className="bg-[#6FA4A1]" onPress={handleSaveProfile} />
          </View>
        </View>
      </Modal>

      <Modal visible={modals.ai} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50 px-5">
          <View className="bg-white rounded-2xl p-6 w-full items-center">
            <View className="bg-teal-50 p-4 rounded-full mb-4"><Brain size={40} color="#6FA4A1" /></View>
            <Text className="text-xl font-bold text-gray-800 mb-2">AI Personalized Enabled</Text>
            <Text className="text-center text-gray-500 mb-6">คุณได้อนุญาตให้ AI วิเคราะห์ประวัติการจองและตำแหน่งเพื่อแนะนำร้านอาหารและเพื่อนที่เหมาะสมกับไลฟ์สไตล์ของคุณแล้ว (อัปเดตเมื่อ: วันนี้)</Text>
            <Button title="ตกลง" className="w-full bg-[#6FA4A1]" onPress={() => closeModal('ai')} />
          </View>
        </View>
      </Modal>

      <Modal visible={modals.privacy} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50 px-5">
          <View className="bg-white rounded-2xl p-6 w-full">
            <Text className="text-xl font-bold text-gray-800 mb-4">Privacy & Data Usage</Text>
            <Text className="text-sm text-gray-600 mb-4">แอป QBuddy มีการจัดเก็บข้อมูลพิกัดและประวัติการจองบน Cloud Database ชั่วคราวเพื่อส่งให้ AI ประมวลผล ข้อมูลถูกเข้ารหัสและจะไม่แชร์ให้บุคคลที่ 3</Text>
            <TouchableOpacity className="py-3 border-b border-gray-100"><Text className="text-red-500 font-bold">ล้างประวัติการแนะนำของ AI</Text></TouchableOpacity>
            <TouchableOpacity className="py-3 mb-4"><Text className="text-gray-700 font-bold">ดูเงื่อนไขการใช้งาน (Terms of Service)</Text></TouchableOpacity>
            <Button title="ปิดหน้าต่าง" onPress={() => closeModal('privacy')} />
          </View>
        </View>
      </Modal>

      <Modal visible={modals.saved} animationType="slide">
        <View className="flex-1 bg-[#F7FAFC] pt-12">
          <View className="px-5 pb-4 border-b border-gray-200 flex-row items-center justify-between bg-white">
            <TouchableOpacity onPress={() => closeModal('saved')}><X size={24} color="#1F2937" /></TouchableOpacity>
            <Text className="text-lg font-bold text-gray-800">Saved Places</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {savedPlaces.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((place) => {
              const isUnsaved = unsavedIds.includes(place.id);
              return (
                <View key={place.id} className="bg-white rounded-2xl p-3 mb-3 shadow-sm flex-row items-center">
                  <Image source={{ uri: place.image }} className="w-16 h-16 rounded-xl mr-4" />
                  <View className="flex-1"><Text className="text-base font-bold text-gray-800" numberOfLines={1}>{place.name}</Text><Text className="text-xs text-gray-500">{place.category} • {place.distance}</Text></View>
                  <TouchableOpacity onPress={() => toggleSavePlace(place.id)} className="p-2"><Bookmark size={24} color={isUnsaved ? "#CBD5E0" : "#6FA4A1"} fill={isUnsaved ? "transparent" : "#6FA4A1"} /></TouchableOpacity>
                </View>
              );
            })}
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onChange={(page) => setCurrentPage(page)} />}
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={modals.general} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">General Settings</Text>
              <TouchableOpacity onPress={() => closeModal('general')}><X color="#4A5568" /></TouchableOpacity>
            </View>
            <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
              <Text className="text-base text-gray-700 font-bold">แจ้งเตือน (Push Notifications)</Text>
              <Switch value={settings.notifications} onValueChange={(v) => setSettings({...settings, notifications: v})} trackColor={{ true: '#6FA4A1', false: '#CBD5E0' }} />
            </View>
            <View className="flex-row justify-between items-center py-4 border-b border-gray-100 mb-6">
              <Text className="text-base text-gray-700 font-bold">การเข้าถึงตำแหน่ง (Location)</Text>
              <Switch value={settings.location} onValueChange={(v) => setSettings({...settings, location: v})} trackColor={{ true: '#6FA4A1', false: '#CBD5E0' }} />
            </View>
            <Button title="บันทึกการตั้งค่า" className="bg-gray-800" onPress={() => closeModal('general')} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}