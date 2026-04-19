import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, Alert, Switch, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Camera, Brain, Shield, Bookmark, Settings, LogOut, ChevronRight, X, ArrowLeft, LucideIcon, Trash2, MapPin, Store, MessageSquareWarning } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input'; 
import { Pagination } from '../../components/ui/Pagination'; 
import { useAppDispatch, useAppSelector } from '../../redux/useRedux';
// เพิ่ม uploadAvatarAsync ในการนำเข้า
import { logoutAsync, updateStatusSuccess, updateProfileAsync, uploadAvatarAsync } from '../../redux/slices/authSlice'; 

import { fetchSavedPlacesAsync, toggleSavePlaceAsync, toggleSavePlaceLocal } from '../../redux/slices/savedPlacesSlice'; 
import { Place } from '../../types';
import { supabase } from '../../config'; 

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const editProfileSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ-นามสกุล"),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: z.string().optional()
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface MenuItemProps { icon: LucideIcon; title: string; subtitle: string; onPress: () => void; iconColor?: string }

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const user = useAppSelector((state: any) => state.auth?.user);
  
  const placesState = useAppSelector((state: any) => state.places);
  const rawPlaces = placesState?.places?.data || placesState?.places || [];
  const allPlaces = Array.isArray(rawPlaces) ? rawPlaces : [];

  const savedPlacesState = useAppSelector((state: any) => state.savedPlaces);
  const savedPlaceIds = savedPlacesState?.savedByUser?.[user?.id || 'guest-123'] || [];

  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [userName, setUserName] = useState(user?.name || '');
  
  const [modals, setModals] = useState({ edit: false, ai: false, privacy: false, saved: false, general: false, report: false });
  const [settings, setSettings] = useState({ notifications: false, location: false });
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const [reportIssue, setReportIssue] = useState('');

  const { control, handleSubmit, reset, formState: { errors } } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '', password: '' }
  });

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSavedPlacesAsync(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`user-status-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'User', filter: `id=eq.${user.id}` },
        (payload) => {
          if (payload.new.status) {
            dispatch(updateStatusSuccess(payload.new.status));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  useEffect(() => {
    const loadProfileData = async () => {
      const storedAvatar = await AsyncStorage.getItem('@user_avatar');
      if (storedAvatar) setAvatarUri(storedAvatar);
      const storedSettings = await AsyncStorage.getItem('@app_settings');
      if (storedSettings) setSettings(JSON.parse(storedSettings));
    };
    loadProfileData();
  }, []);

  // ฟังก์ชันใหม่สำหรับจัดการการกดเปลี่ยนรูปโปรไฟล์
  const handleEditPhoto = async () => {
    Alert.alert(
      "เปลี่ยนรูปโปรไฟล์",
      "เลือกช่องทางที่ต้องการ",
      [
        {
          text: "ถ่ายรูปใหม่",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled) handleUploadImage(result.assets[0].uri);
          }
        },
        {
          text: "เลือกจากคลังรูปภาพ",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled) handleUploadImage(result.assets[0].uri);
          }
        },
        { text: "ยกเลิก", style: "cancel" }
      ]
    );
  };

  const handleUploadImage = async (uri: string) => {
    try {
      await dispatch(uploadAvatarAsync(uri)).unwrap();
      setAvatarUri(uri);
      Alert.alert("สำเร็จ", "อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว");
    } catch (error: any) {
      Alert.alert("ผิดพลาด", error);
    }
  };

  const savedPlacesList = useMemo(() => {
    return allPlaces.filter((place: Place) => savedPlaceIds.includes(place.id));
  }, [allPlaces, savedPlaceIds]);

  const totalPages = Math.ceil(savedPlacesList.length / ITEMS_PER_PAGE);

  const openModal = (key: keyof typeof modals) => {
    if (key === 'edit') reset({ name: user?.name || '', email: user?.email || '', password: '' }); 
    setModals({ ...modals, [key]: true });
  };
  const closeModal = (key: keyof typeof modals) => setModals({ ...modals, [key]: false });

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
    if (value) Alert.alert('แจ้งเตือน', 'ฟีเจอร์นี้จะทำงานได้สมบูรณ์เมื่อติดตั้งแอปพลิเคชันจริง');
    const newSettings = { ...settings, notifications: value };
    setSettings(newSettings);
    await AsyncStorage.setItem('@app_settings', JSON.stringify(newSettings));
  };

  const onSaveProfile = async (data: EditProfileFormData) => {
    const updateData: any = {};
    if (data.name !== user?.name) updateData.name = data.name;
    if (data.email !== user?.email) updateData.email = data.email;
    if (data.password && data.password.trim().length > 0) updateData.password = data.password;

    if (Object.keys(updateData).length === 0) {
      Alert.alert('แจ้งเตือน', 'คุณยังไม่ได้แก้ไขข้อมูลใดๆ');
      return;
    }

    try {
      await dispatch(updateProfileAsync(updateData)).unwrap();
      setUserName(data.name);
      Alert.alert('สำเร็จ', 'อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว');
      closeModal('edit');
    } catch (error: any) {
      Alert.alert('เกิดข้อผิดพลาด', error);
    }
  };

  const removeSavedPlace = (placeId: string) => {
    const userId = user?.id || 'guest-123';
    dispatch(toggleSavePlaceLocal({ userId, placeId }));
    dispatch(toggleSavePlaceAsync({ userId, placeId }));
    if (savedPlacesList.length <= 1) closeModal('saved'); 
  };

  const submitReport = () => {
    if (reportIssue.trim() === '') return Alert.alert('แจ้งเตือน', 'กรุณาระบุรายละเอียดปัญหาที่พบ');
    Alert.alert('ส่งรายงานเรียบร้อย', 'เราได้รับข้อมูล Ticket ของคุณแล้ว เจ้าหน้าที่จะทำการตรวจสอบและแจ้งกลับให้เร็วที่สุดครับ', [{ text: 'ตกลง', onPress: () => { setReportIssue(''); closeModal('report'); } }]);
  };

  // -------------------------------------------------------------------------
  // จุดที่แก้ไข: รองรับการกด Logout ทั้งบน Web และ Mobile
  // -------------------------------------------------------------------------
  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // สำหรับบน Web Browser
      const confirmLogout = window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?');
      if (confirmLogout) {
        dispatch(logoutAsync(user?.id)).then(() => {
          router.replace('/(auth)/Login');
        });
      }
    } else {
      // สำหรับบน iOS / Android
      Alert.alert('ยืนยันออกจากระบบ', 'คุณต้องการออกจากระบบใช่หรือไม่?', [
        { text: 'ยกเลิก', style: 'cancel' },
        { 
          text: 'ออกจากระบบ', 
          style: 'destructive', 
          onPress: async () => {
            await dispatch(logoutAsync(user?.id));
            router.replace('/(auth)/Login');
          } 
        } 
      ]);
    }
  };
  // -------------------------------------------------------------------------

  const MenuItem = ({ icon: Icon, title, subtitle, onPress, iconColor = "#475569" }: MenuItemProps) => (
    <TouchableOpacity onPress={onPress} className="flex-row items-center bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100">
      <View className="bg-slate-50 p-2.5 rounded-full mr-4"><Icon size={22} color={iconColor} /></View>
      <View className="flex-1"><Text className="text-base font-bold text-gray-800">{title}</Text><Text className="text-xs text-gray-500 mt-0.5">{subtitle}</Text></View>
      <ChevronRight size={20} color="#CBD5E0" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View className="flex-1 bg-[#F7FAFC]">
        <View className="px-5 pb-4 pt-2 flex-row items-center justify-between bg-white shadow-sm z-10">
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#1F2937" /></TouchableOpacity>
          <Text className="text-lg font-bold text-gray-800">Profile & Settings</Text>
          <TouchableOpacity onPress={() => openModal('edit')}><Text className="text-base font-bold text-[#6FA4A1]">Edit</Text></TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="items-center mt-8 mb-6">
            <View className="relative">
              {/* แสดงรูปโปรไฟล์ปัจจุบันและเพิ่มความสามารถในการเปลี่ยนรูป */}
              <Image 
                source={{ uri: user?.avatarUrl || avatarUri || 'https://i.pravatar.cc/150?u=a042581f4e29026024d' }} 
                className="w-28 h-28 rounded-full border-4 border-white shadow-sm" 
              />
              
              {/* ปุ่มกล้องถ่ายรูปสำหรับแก้ไข */}
              <TouchableOpacity 
                onPress={handleEditPhoto}
                className="absolute bottom-0 right-0 bg-[#6FA4A1] p-2 rounded-full border-2 border-white shadow-md"
              >
                <Camera size={18} color="white" />
              </TouchableOpacity>

              <View className={`absolute top-1 right-1 w-6 h-6 rounded-full border-4 border-white ${user?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`} />
            </View>
            <Text className="text-2xl font-extrabold text-gray-800 mt-4">{user?.name || userName}</Text>
            <Text className="text-sm text-gray-500 mt-1">queue.ai/u/{(user?.name || userName).toLowerCase().replace(/\s/g, '')}</Text>
          </View>

          <View className="px-5">
            <MenuItem icon={Brain} title="AI Preferences" subtitle="Manage recommendation logic" onPress={() => openModal('ai')} />
            <MenuItem icon={Shield} title="Privacy & Data Usage" subtitle="Control what AI sees & Account" onPress={() => openModal('privacy')} />
            <MenuItem icon={Bookmark} title="Saved Places" subtitle="Your favorite locations" onPress={() => openModal('saved')} />
            <MenuItem icon={Settings} title="General Settings" subtitle="Permissions, App Version" onPress={() => openModal('general')} />
            <MenuItem icon={MessageSquareWarning} title="Report Issue / Support" subtitle="ติดต่อเจ้าหน้าที่ หรือ รายงานปัญหา" onPress={() => openModal('report')} iconColor="#DD6B20" />

            <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center bg-white py-4 rounded-2xl mt-6 border border-gray-200 shadow-sm">
              <LogOut size={20} color="#475569" className="mr-2" />
              <Text className="text-base font-bold text-gray-700">Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <Modal visible={modals.edit} animationType="slide" transparent={true} statusBarTranslucent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-800">Edit Profile</Text>
              <TouchableOpacity onPress={() => closeModal('edit')}><X color="#4A5568" /></TouchableOpacity>
            </View>

            <Text className="text-sm font-bold text-gray-600 mb-2">Name</Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Input 
                    placeholder="Enter your name" 
                    value={value} 
                    onChangeText={onChange} 
                  />
                  {errors.name?.message && <Text className="text-red-500 text-xs mt-1">{errors.name.message}</Text>}
                </View>
              )}
            />

            <Text className="text-sm font-bold text-gray-600 mb-2 mt-4">Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Input 
                    placeholder="Enter your email" 
                    value={value} 
                    onChangeText={onChange} 
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {errors.email?.message && <Text className="text-red-500 text-xs mt-1">{errors.email.message}</Text>}
                </View>
              )}
            />

            <Text className="text-sm font-bold text-gray-600 mb-2 mt-4">New Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View>
                  <Input 
                    placeholder="Leave blank to keep current password" 
                    value={value || ''} 
                    onChangeText={onChange} 
                    secureTextEntry
                  />
                  {errors.password?.message && <Text className="text-red-500 text-xs mt-1">{errors.password.message}</Text>}
                </View>
              )}
            />

            <Button title="Save Changes" className="bg-[#6FA4A1] mt-8" onPress={handleSubmit(onSaveProfile)} />
          </View>
        </View>
      </Modal>

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
                savedPlacesList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((place: Place & { distance?: string | number, category?: string }) => {
                  
                  let imgArray: string[] = [];
                  const parseString = (str: string | undefined) => {
                    if (!str) return [];
                    if (str.startsWith('[') && str.endsWith(']')) {
                      try { return JSON.parse(str); } catch (e) { return [str]; }
                    }
                    if (str.includes(',')) return str.split(',').map(s => s.trim());
                    return [str];
                  };
                  if (place.coverUrl) imgArray = parseString(place.coverUrl);
                  if (imgArray.length === 0 && place.image) imgArray = parseString(place.image);
                  const displayImg = imgArray[0] || 'https://via.placeholder.com/150';

                  return (
                    <View key={place.id} className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex-row items-center">
                      <Image source={{ uri: displayImg }} className="w-16 h-16 rounded-xl mr-4" />
                      <View className="flex-1">
                        <Text className="text-base font-bold text-gray-800 mb-1" numberOfLines={1}>{place.name}</Text>
                        <View className="flex-row items-center"><Store size={12} color="#718096" /><Text className="text-xs text-gray-500 ml-1">{place.category}</Text></View>
                        <View className="flex-row items-center mt-1"><MapPin size={12} color="#718096" /><Text className="text-xs text-gray-500 ml-1" numberOfLines={1}>{place.distance || 'ไม่ทราบระยะทาง'}</Text></View>
                      </View>
                      <TouchableOpacity onPress={() => removeSavedPlace(place.id)} className="p-3 bg-yellow-50 rounded-full ml-2">
                        <Bookmark size={20} color="#D69E2E" fill="#ECC94B" />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
              {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onChange={(page) => setCurrentPage(page)} />}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal visible={modals.report} animationType="slide" transparent={true} statusBarTranslucent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <MessageSquareWarning size={24} color="#DD6B20" className="mr-2"/>
                <Text className="text-xl font-bold text-gray-800">รายงานปัญหา</Text>
              </View>
              <TouchableOpacity onPress={() => closeModal('report')}><X color="#4A5568" /></TouchableOpacity>
            </View>
            
            <Text className="text-sm font-bold text-gray-600 mb-2">รายละเอียดปัญหาที่คุณพบ</Text>
            <TextInput 
              style={{ backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#EDF2F7', borderRadius: 12, padding: 16, fontSize: 15, color: '#2D3748', height: 120, textAlignVertical: 'top', marginBottom: 20 }} 
              placeholder="อธิบายปัญหา เช่น จองคิวไม่ได้, แอปค้าง..." 
              multiline 
              value={reportIssue} 
              onChangeText={setReportIssue} 
            />
            <Text className="text-xs text-gray-400 mb-6 text-center">ข้อมูลของคุณจะถูกเปิดเป็น Ticket เพื่อให้ทีมงานตรวจสอบโดยเร็วที่สุด</Text>
            <Button title="ส่งรายงานให้เจ้าหน้าที่" className="bg-[#DD6B20]" onPress={submitReport} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}