// src/app/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, TextInput, Alert, Switch } from 'react-native';
import { Camera, Brain, Shield, Bookmark, Settings, Clock, LogOut, ChevronRight, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import { ProfileLayout } from '../../layouts/ProfileLayout';
import { useAuth } from '../../context/auth/use.Auth';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination'; 

// --- MOCK DATA สำหรับ Saved Places ---
const MOCK_SAVED_PLACES = [
  { id: '1', name: 'ชาบูชิ (Shabushi)', category: 'บุฟเฟต์', rating: 4.5, image: 'https://images.unsplash.com/photo-1526462153549-36224314cfa8?w=200', distance: '1.2 กม.' },
  { id: '2', name: 'เอ็มเค สุกี้ (MK)', category: 'สุกี้', rating: 4.8, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200', distance: '2.0 กม.' },
  { id: '3', name: 'ซูชิ ฮิโระ', category: 'ญี่ปุ่น', rating: 4.9, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200', distance: '3.5 กม.' },
  { id: '4', name: 'ส้มตำนัว', category: 'อีสาน', rating: 4.2, image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=200', distance: '0.8 กม.' },
  { id: '5', name: 'Cafe Amazon', category: 'คาเฟ่', rating: 4.1, image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200', distance: '1.0 กม.' },
  { id: '6', name: 'บาร์บีคิวพลาซ่า', category: 'ปิ้งย่าง', rating: 4.6, image: 'https://images.unsplash.com/photo-1544025162-817865c192fa?w=200', distance: '4.2 กม.' },
  { id: '7', name: 'ตี๋น้อย', category: 'บุฟเฟต์', rating: 4.7, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200', distance: '5.5 กม.' },
  { id: '8', name: 'อุทยานแห่งชาติ', category: 'ท่องเที่ยว', rating: 4.8, image: 'https://images.unsplash.com/photo-1582293041079-7814c2b12063?w=200', distance: '120 กม.' },
];

export default function ProfilePage() {
  const router = useRouter();
  // แก้บั๊ก Logout: ต้องเรียกใช้ฟังก์ชัน logout() จาก Context เพื่อเคลียร์ Global State ด้วย
  const { user, logout } = useAuth(); 

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [userName, setUserName] = useState(user?.name || 'คุณ Tee');
  const [userEmail, setUserEmail] = useState(user?.email || 'tee@queue.ai');

  const [modals, setModals] = useState({
    edit: false, ai: false, privacy: false, saved: false, general: false
  });

  const [savedPlaces, setSavedPlaces] = useState<any[]>([]);
  const [unsavedIds, setUnsavedIds] = useState<string[]>([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const totalPages = Math.ceil(savedPlaces.length / ITEMS_PER_PAGE);

  const [settings, setSettings] = useState({ notifications: true, location: true });

  // ==========================================
  //  1. โหลดข้อมูลเริ่มต้น (Load Data)
  // ==========================================
  useEffect(() => {
    const loadProfileData = async () => {
      /*
      //  FUTURE API: ดึงข้อมูล Profile และ Saved Places จาก DB
      // try {
      //   const profileRes = await axios.get(`/api/users/${user?.id}`);
      //   setUserName(profileRes.data.name);
      //   setUserEmail(profileRes.data.email);
      //   setAvatarUri(profileRes.data.avatar_url);
      //   
      //   const savedRes = await axios.get(`/api/users/${user?.id}/bookmarks`);
      //   setSavedPlaces(savedRes.data);
      // } catch (error) {
      //   console.error("Fetch profile error", error);
      // }
      */

      const storedAvatar = await AsyncStorage.getItem('@user_avatar');
      if (storedAvatar) setAvatarUri(storedAvatar);

      const storedPlacesStr = await AsyncStorage.getItem('@saved_places');
      if (storedPlacesStr) {
        setSavedPlaces(JSON.parse(storedPlacesStr));
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
      setSavedPlaces(filtered);
      setUnsavedIds([]);
      setCurrentPage(1);
    }
    setModals({ ...modals, [key]: true });
  };
  const closeModal = (key: keyof typeof modals) => setModals({ ...modals, [key]: false });

  // ==========================================
  //  2. อัปโหลดรูปภาพ (Upload Avatar)
  // ==========================================
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('ขออภัย', 'แอปจำเป็นต้องเข้าถึงคลังรูปภาพเพื่อเปลี่ยนรูปโปรไฟล์');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      await AsyncStorage.setItem('@user_avatar', result.assets[0].uri);
      
      /*
      //  FUTURE API: อัปโหลดรูปภาพลง Storage/DB
      // const formData = new FormData();
      // formData.append('avatar', { uri: result.assets[0].uri, name: 'avatar.jpg', type: 'image/jpeg' });
      // await axios.post(`/api/users/${user?.id}/avatar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      */
    }
  };

  // ==========================================
  //  3. อัปเดตโปรไฟล์ (Update Profile)
  // ==========================================
  const handleSaveProfile = async () => {
    try {
      /*
      //  FUTURE API: อัปเดตข้อมูล User ลง DB (ตาราง User)
      // await axios.put(`/api/users/${user?.id}`, { 
      //   name: userName, 
      //   email: userEmail 
      // });
      */
      
      Alert.alert('สำเร็จ', 'อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว');
      closeModal('edit');
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลได้');
    }
  };

  // ==========================================
  //  4. เพิ่ม/ลบ ร้านโปรด (Toggle Bookmark)
  // ==========================================
  const toggleSavePlace = async (id: string) => {
    let newUnsaved = [...unsavedIds];
    if (newUnsaved.includes(id)) {
      newUnsaved = newUnsaved.filter(item => item !== id); 
    } else {
      newUnsaved.push(id); 
    }
    setUnsavedIds(newUnsaved);
    
    const actualSaved = savedPlaces.filter(p => !newUnsaved.includes(p.id));
    await AsyncStorage.setItem('@saved_places', JSON.stringify(actualSaved));

    /*
    //  FUTURE API: เพิ่ม/ลบ Saved Place ใน DB
    // if(newUnsaved.includes(id)) {
    //   await axios.delete(`/api/users/${user?.id}/bookmarks/${id}`); // ลบออก
    // } else {
    //   await axios.post(`/api/users/${user?.id}/bookmarks`, { restaurant_id: id }); // เซฟใหม่
    // }
    */
  };

  // ==========================================
  //  5. ออกจากระบบ (Logout)
  // ==========================================
  const handleLogout = async () => {
    Alert.alert('ยืนยันออกจากระบบ', 'คุณต้องการออกจากระบบใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { 
        text: 'ออกจากระบบ', 
        style: 'destructive', 
        onPress: async () => {
          //แก้บั๊กตรงนี้: ใช้ฟังก์ชัน logout จาก Context เพื่อเคลียร์ Global State 
          await logout(); 
          router.replace('/pages/Login' as any);
        }
      }
    ]);
  };

  const MenuItem = ({ icon: Icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity onPress={onPress} className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100">
      <View className="bg-slate-50 p-2.5 rounded-full mr-4">
        <Icon size={22} color="#475569" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-800">{title}</Text>
        <Text className="text-xs text-gray-500 mt-0.5">{subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#CBD5E0" />
    </TouchableOpacity>
  );

  return (
    <ProfileLayout onEditPress={() => openModal('edit')}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View className="items-center mt-8 mb-6">
          <View className="relative">
            <Image source={{ uri: avatarUri || 'https://i.pravatar.cc/150?u=a042581f4e29026024d' }} className="w-28 h-28 rounded-full border-4 border-white shadow-sm" />
            <TouchableOpacity onPress={handlePickImage} className="absolute bottom-0 right-0 bg-[#6FA4A1] p-2 rounded-full border-2 border-white shadow-md">
              <Camera size={16} color="#FFF" />
            </TouchableOpacity>
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

          {/* ปุ่ม Logout */}
          <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center bg-white py-4 rounded-2xl mt-4 border border-gray-200 shadow-sm">
            <LogOut size={20} color="#475569" className="mr-2" />
            <Text className="text-base font-bold text-gray-700">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 1. Modal: Edit Profile */}
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

      {/* 2. Modal: AI Preferences */}
      <Modal visible={modals.ai} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50 px-5">
          <View className="bg-white rounded-2xl p-6 w-full items-center">
            <View className="bg-teal-50 p-4 rounded-full mb-4"><Brain size={40} color="#6FA4A1" /></View>
            <Text className="text-xl font-bold text-gray-800 mb-2">AI Personalized Enabled</Text>
            <Text className="text-center text-gray-500 mb-6">
              คุณได้อนุญาตให้ AI วิเคราะห์ประวัติการจองและตำแหน่งเพื่อแนะนำร้านอาหารและเพื่อนที่เหมาะสมกับไลฟ์สไตล์ของคุณแล้ว (อัปเดตเมื่อ: วันนี้)
            </Text>
            <Button title="ตกลง" className="w-full bg-[#6FA4A1]" onPress={() => closeModal('ai')} />
          </View>
        </View>
      </Modal>

      {/* 3. Modal: Privacy & Data Usage */}
      <Modal visible={modals.privacy} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50 px-5">
          <View className="bg-white rounded-2xl p-6 w-full">
            <Text className="text-xl font-bold text-gray-800 mb-4">Privacy & Data Usage</Text>
            <Text className="text-sm text-gray-600 mb-4">
              แอป QBuddy มีการจัดเก็บข้อมูลพิกัด (Location) และประวัติการจอง (Booking History) ของคุณบน Cloud Database ชั่วคราวเพื่อส่งให้ AI ประมวลผล ข้อมูลทั้งหมดถูกเข้ารหัส (Encrypted) และจะไม่แชร์ให้บุคคลที่ 3
            </Text>
            <TouchableOpacity className="py-3 border-b border-gray-100"><Text className="text-red-500 font-bold">ล้างประวัติการแนะนำของ AI</Text></TouchableOpacity>
            <TouchableOpacity className="py-3 mb-4"><Text className="text-gray-700 font-bold">ดูเงื่อนไขการใช้งาน (Terms of Service)</Text></TouchableOpacity>
            <Button title="ปิดหน้าต่าง" onPress={() => closeModal('privacy')} />
          </View>
        </View>
      </Modal>

      {/* 4. Modal: Saved Places */}
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
                  <View className="flex-1">
                    <Text className="text-base font-bold text-gray-800" numberOfLines={1}>{place.name}</Text>
                    <Text className="text-xs text-gray-500">{place.category} • {place.distance}</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleSavePlace(place.id)} className="p-2">
                    <Bookmark size={24} color={isUnsaved ? "#CBD5E0" : "#6FA4A1"} fill={isUnsaved ? "transparent" : "#6FA4A1"} />
                  </TouchableOpacity>
                </View>
              );
            })}
            
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onChange={(page) => setCurrentPage(page)} 
              />
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* 5. Modal: General Settings */}
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

    </ProfileLayout>
  );
}