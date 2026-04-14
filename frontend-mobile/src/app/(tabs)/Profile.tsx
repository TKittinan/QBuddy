import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, Alert, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // 🌟 ใช้ SafeAreaView ตัวนี้
import { Camera, Brain, Shield, Bookmark, Settings, LogOut, ChevronRight, X, ArrowLeft, LucideIcon, Trash2, MapPin, Store } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input'; 
import { Pagination } from '../../components/ui/Pagination'; 
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { logout } from '../../redux/slices/authSlice';

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const editProfileSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ-นามสกุล"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง")
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface MenuItemProps { icon: LucideIcon; title: string; subtitle: string; onPress: () => void; iconColor?: string }

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  
  const allPlaces = useAppSelector(state => state.places?.places || []);

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [userName, setUserName] = useState(user?.name || '');
  const [modals, setModals] = useState({ edit: false, ai: false, privacy: false, saved: false, general: false });
  
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);
  const [settings, setSettings] = useState({ notifications: false, location: false });
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { name: user?.name || "", email: user?.email || "" }
  });

  useEffect(() => {
    const loadProfileData = async () => {
      const storedAvatar = await AsyncStorage.getItem('@user_avatar');
      if (storedAvatar) setAvatarUri(storedAvatar);

      const storedPlacesStr = await AsyncStorage.getItem('@saved_place_ids');
      if (storedPlacesStr) {
        setSavedPlaceIds(JSON.parse(storedPlacesStr));
      }

      const storedSettings = await AsyncStorage.getItem('@app_settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    };
    loadProfileData();
  }, []);

  const savedPlacesList = useMemo(() => {
    return allPlaces.filter((place: any) => savedPlaceIds.includes(place.id));
  }, [allPlaces, savedPlaceIds]);

  const totalPages = Math.ceil(savedPlacesList.length / ITEMS_PER_PAGE);

  const openModal = (key: keyof typeof modals) => {
    if (key === 'edit') reset({ name: user?.name || "", email: user?.email || "" }); 
    setModals({ ...modals, [key]: true });
  };
  const closeModal = (key: keyof typeof modals) => setModals({ ...modals, [key]: false });

  const handlePickImage = async () => {
    Alert.alert(
      "เปลี่ยนรูปโปรไฟล์",
      "เลือกวิธีที่คุณต้องการอัปโหลดรูปภาพ",
      [
        {
          text: "ถ่ายรูปใหม่",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('แจ้งเตือน', 'คุณต้องอนุญาตให้แอปเข้าถึงกล้องถ่ายรูปในการตั้งค่าเครื่อง');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
            if (!result.canceled) {
              setAvatarUri(result.assets[0].uri);
              await AsyncStorage.setItem('@user_avatar', result.assets[0].uri);
            }
          }
        },
        {
          text: "เลือกจากแกลเลอรี",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('แจ้งเตือน', 'คุณต้องอนุญาตให้แอปเข้าถึงคลังรูปภาพในการตั้งค่าเครื่อง');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
            if (!result.canceled) {
              setAvatarUri(result.assets[0].uri);
              await AsyncStorage.setItem('@user_avatar', result.assets[0].uri);
            }
          }
        },
        { text: "ยกเลิก", style: "cancel" }
      ]
    );
  };

  const toggleLocation = async (value: boolean) => {
    if (value) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('แจ้งเตือน', 'ไม่สามารถเปิดใช้งานได้ กรุณาไปเปิดสิทธิ์ Location ในการตั้งค่าของเครื่องคุณ');
        return; 
      }
    }
    const newSettings = { ...settings, location: value };
    setSettings(newSettings);
    await AsyncStorage.setItem('@app_settings', JSON.stringify(newSettings));
  };

  const toggleNotification = async (value: boolean) => {
    if (value) {
      Alert.alert('แจ้งเตือน', 'ฟีเจอร์นี้จะทำงานได้สมบูรณ์เมื่อติดตั้งแอปพลิเคชันจริง');
    }
    const newSettings = { ...settings, notifications: value };
    setSettings(newSettings);
    await AsyncStorage.setItem('@app_settings', JSON.stringify(newSettings));
  };

  const onSaveProfile = async (data: EditProfileFormData) => {
    setUserName(data.name);
    Alert.alert('สำเร็จ', 'อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว');
    closeModal('edit');
  };

  const removeSavedPlace = async (placeId: string) => {
    const updatedIds = savedPlaceIds.filter(id => id !== placeId);
    setSavedPlaceIds(updatedIds);
    await AsyncStorage.setItem('@saved_place_ids', JSON.stringify(updatedIds));
    if (updatedIds.length === 0) closeModal('saved');
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    Alert.alert(
      'ลบบัญชีผู้ใช้ถาวร',
      'หากลบบัญชี ข้อมูลส่วนตัว ประวัติการจอง และคิวทั้งหมดของคุณจะถูกลบออกจากระบบอย่างถาวร ยืนยันหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ยืนยันการลบ', 
          style: 'destructive', 
          onPress: async () => {
            await AsyncStorage.clear();
            dispatch(logout());
          } 
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('ยืนยันออกจากระบบ', 'คุณต้องการออกจากระบบใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ออกจากระบบ', style: 'destructive', onPress: () => dispatch(logout()) }
    ]);
  };

  const MenuItem = ({ icon: Icon, title, subtitle, onPress, iconColor = "#475569" }: MenuItemProps) => (
    <TouchableOpacity onPress={onPress} className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100">
      <View className="bg-slate-50 p-2.5 rounded-full mr-4"><Icon size={22} color={iconColor} /></View>
      <View className="flex-1"><Text className="text-base font-bold text-gray-800">{title}</Text><Text className="text-xs text-gray-500 mt-0.5">{subtitle}</Text></View>
      <ChevronRight size={20} color="#CBD5E0" />
    </TouchableOpacity>
  );

  return (
    // 🌟 1. ครอบทั้งหน้าด้วย SafeAreaView และตั้งพื้นหลังให้แถบ Status Bar เป็นสีขาว (#FFFFFF)
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View className="flex-1 bg-[#F7FAFC]">
        {/* Header เนียนๆ สีขาว พร้อม Shadow เหมือน SmartFeed */}
        <View className="px-5 pb-4 pt-2 flex-row items-center justify-between bg-white shadow-sm z-10">
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
            <MenuItem icon={Shield} title="Privacy & Data Usage" subtitle="Control what AI sees & Account" onPress={() => openModal('privacy')} />
            <MenuItem icon={Bookmark} title="Saved Places" subtitle="Your favorite locations" onPress={() => openModal('saved')} />
            <MenuItem icon={Settings} title="General Settings" subtitle="Permissions, App Version" onPress={() => openModal('general')} />

            <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center bg-white py-4 rounded-2xl mt-6 border border-gray-200 shadow-sm">
              <LogOut size={20} color="#475569" className="mr-2" />
              <Text className="text-base font-bold text-gray-700">Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* ======================= MODALS ======================= */}
      {/* 🌟 2. ใส่ statusBarTranslucent={true} ให้ทุก Modal เพื่อให้ทะลุขอบจอบน Android */}
      <Modal visible={modals.edit} animationType="slide" transparent={true} statusBarTranslucent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Edit Profile</Text>
              <TouchableOpacity onPress={() => closeModal('edit')}><X color="#4A5568" /></TouchableOpacity>
            </View>
            
            <View style={{ marginBottom: 16 }}>
              <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
                <View><Input label="ชื่อ - นามสกุล" value={value} onChangeText={onChange} inputContainerStyle={errors.name ? { borderColor: '#E53E3E', borderWidth: 1.5 } : undefined} />
                {errors.name && <Text style={{ color: '#E53E3E', fontSize: 12, marginTop: 4 }}>{errors.name.message}</Text>}</View>
              )}/>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
                <View><Input label="อีเมล" keyboardType="email-address" value={value} onChangeText={onChange} inputContainerStyle={errors.email ? { borderColor: '#E53E3E', borderWidth: 1.5 } : undefined} />
                {errors.email && <Text style={{ color: '#E53E3E', fontSize: 12, marginTop: 4 }}>{errors.email.message}</Text>}</View>
              )}/>
            </View>

            <Button title="บันทึกข้อมูล" className="bg-[#6FA4A1]" onPress={handleSubmit(onSaveProfile)} />
          </View>
        </View>
      </Modal>

      <Modal visible={modals.privacy} animationType="fade" transparent={true} statusBarTranslucent={true}>
        <View className="flex-1 justify-center items-center bg-black/50 px-5">
          <View className="bg-white rounded-3xl p-6 w-full">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Privacy & Data</Text>
              <TouchableOpacity onPress={() => closeModal('privacy')}><X color="#A0AEC0" /></TouchableOpacity>
            </View>
            <Text className="text-sm text-gray-600 mb-6 leading-relaxed">
              QBuddy ให้ความสำคัญกับข้อมูลส่วนบุคคลของคุณ เรามีการเก็บพิกัดและประวัติการใช้งานเพื่อประมวลผลระบบคิวและ AI เท่านั้น โดยจะไม่มีการแชร์ข้อมูลให้กับบุคคลที่ 3 เด็ดขาด
            </Text>
            
            <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
              <Text className="text-gray-700 font-bold flex-1">นโยบายความเป็นส่วนตัว (Privacy Policy)</Text>
              <ChevronRight size={16} color="#CBD5E0" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center py-3 mb-6">
              <Text className="text-gray-700 font-bold flex-1">เงื่อนไขการให้บริการ (Terms of Service)</Text>
              <ChevronRight size={16} color="#CBD5E0" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDeleteAccount} className="bg-red-50 p-4 rounded-xl flex-row items-center justify-center border border-red-100">
              <Trash2 size={18} color="#E53E3E" className="mr-2" />
              <Text className="text-red-600 font-bold">ลบบัญชีผู้ใช้อย่างถาวร</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🌟 3. จัดการโครงสร้างหน้า Saved Places ใหม่ให้เหมือนหน้าหลักเป๊ะๆ */}
      <Modal visible={modals.saved} animationType="slide" statusBarTranslucent={true}>
        <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
          <View className="flex-1 bg-[#F7FAFC]">
            <View className="px-5 pb-4 pt-2 flex-row items-center justify-between bg-white shadow-sm z-10">
              <TouchableOpacity onPress={() => closeModal('saved')}><ArrowLeft size={24} color="#1F2937" /></TouchableOpacity>
              <Text className="text-lg font-bold text-gray-800">Saved Places</Text>
              <View style={{ width: 24 }} />
            </View>
            
            <ScrollView contentContainerStyle={{ padding: 20 }}>
              {savedPlacesList.length === 0 ? (
                <View className="items-center justify-center pt-20">
                  <Bookmark size={48} color="#CBD5E0" className="mb-4" />
                  <Text className="text-lg font-bold text-gray-800">ไม่มีสถานที่ที่บันทึกไว้</Text>
                  <Text className="text-gray-500 mt-2 text-center">คุณสามารถกดบันทึกร้านอาหารหรือคาเฟ่ที่คุณชอบ เพื่อให้แสดงในหน้านี้ได้</Text>
                </View>
              ) : (
                savedPlacesList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((place: any) => (
                  <View key={place.id} className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex-row items-center">
                    <Image source={{ uri: place.logoUrl || place.coverUrl || 'https://via.placeholder.com/150' }} className="w-16 h-16 rounded-xl mr-4" />
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-800 mb-1" numberOfLines={1}>{place.name}</Text>
                      <View className="flex-row items-center"><Store size={12} color="#718096" /><Text className="text-xs text-gray-500 ml-1">{place.categories?.[0] || "ทั่วไป"}</Text></View>
                      <View className="flex-row items-center mt-1"><MapPin size={12} color="#718096" /><Text className="text-xs text-gray-500 ml-1" numberOfLines={1}>{place.address}</Text></View>
                    </View>
                    <TouchableOpacity onPress={() => removeSavedPlace(place.id)} className="p-3 bg-teal-50 rounded-full ml-2">
                      <Bookmark size={20} color="#6FA4A1" fill="#6FA4A1" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
              {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onChange={(page) => setCurrentPage(page)} />}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={modals.general} animationType="slide" transparent={true} statusBarTranslucent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">General Settings</Text>
              <TouchableOpacity onPress={() => closeModal('general')}><X color="#4A5568" /></TouchableOpacity>
            </View>
            
            <View className="flex-row justify-between items-center py-4 border-b border-gray-100">
              <View>
                <Text className="text-base text-gray-700 font-bold">แจ้งเตือนแอปพลิเคชัน</Text>
                <Text className="text-xs text-gray-400 mt-1">รับการแจ้งเตือนเมื่อใกล้ถึงคิว</Text>
              </View>
              <Switch value={settings.notifications} onValueChange={toggleNotification} trackColor={{ true: '#6FA4A1', false: '#CBD5E0' }} />
            </View>

            <View className="flex-row justify-between items-center py-4 mb-4 border-b border-gray-100">
              <View>
                <Text className="text-base text-gray-700 font-bold">การเข้าถึงตำแหน่ง</Text>
                <Text className="text-xs text-gray-400 mt-1">เพื่อค้นหาร้านค้าระยะใกล้</Text>
              </View>
              <Switch value={settings.location} onValueChange={toggleLocation} trackColor={{ true: '#6FA4A1', false: '#CBD5E0' }} />
            </View>
            
            <View className="items-center mt-2 mb-6">
              <Text className="text-sm font-bold text-gray-400">Version 1.0.0</Text>
            </View>

            <Button title="ตกลง" className="bg-gray-800" onPress={() => closeModal('general')} />
          </View>
        </View>
      </Modal>

      <Modal visible={modals.ai} animationType="fade" transparent={true} statusBarTranslucent={true}>
        <View className="flex-1 justify-center items-center bg-black/50 px-5">
          <View className="bg-white rounded-3xl p-6 w-full items-center relative">
            <TouchableOpacity className="absolute top-4 right-4 z-10" onPress={() => closeModal('ai')}><X color="#A0AEC0" /></TouchableOpacity>
            <View className="bg-teal-50 p-4 rounded-full mb-4 mt-2"><Brain size={40} color="#6FA4A1" /></View>
            <Text className="text-xl font-bold text-gray-800 mb-2">AI Personalized Enabled</Text>
            <Text className="text-center text-gray-500 mb-6 leading-relaxed">
              คุณได้อนุญาตให้ AI วิเคราะห์ประวัติการจองและพฤติกรรมของคุณ เพื่อนำเสนอร้านอาหารและเพื่อนที่เข้ากับไลฟ์สไตล์ให้คุณแล้ว
            </Text>
            <Button title="ตกลง" className="w-full bg-[#6FA4A1]" onPress={() => closeModal('ai')} />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}