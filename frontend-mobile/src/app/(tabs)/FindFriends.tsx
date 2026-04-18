import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Modal, Alert, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { Search, Plus, Minus, X, ArrowLeft, MapPin, MessageCircle, CheckCircle2 } from 'lucide-react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

import { useAppSelector, useAppDispatch } from '../../redux/useRedux';
import { addPostAsync, joinPostAsync, fetchPostsAsync, updatePostStatus } from '../../redux/slices/postSlice';

import { PartyActivity, Ticket, Place, User, Guest, TableType } from '../../types';
// 🌟 นำเข้า RootState จาก Redux store โดยตรง
import { RootState } from '../../redux'; 

export default function FindFriendsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch(); 
  
  // 🌟 ใช้ RootState ของจริงจากระบบ แทน LocalRootState ที่สร้างมั่ว
  const user: User | null = useAppSelector((state: RootState) => state.auth.user);
  
  // 🌟 ดึงข้อมูลโดยไม่ต้องแปลงโครงสร้าง เพราะ RootState รู้จักโครงสร้างของจริงแล้ว
  const allActivities: PartyActivity[] = useAppSelector((state: RootState) => state.post.posts || []);
  const allTickets: Ticket[] = useAppSelector((state: RootState) => state.queue.tickets || []);
  const places: Place[] = useAppSelector((state: RootState) => state.places.places || []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ร้านอาหาร');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [activityDesc, setActivityDesc] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [selectedActivityToJoin, setSelectedActivityToJoin] = useState<PartyActivity | null>(null);
  const [joinPax, setJoinPax] = useState<number>(1);

  const [isChatListModalVisible, setIsChatListModalVisible] = useState(false);

  const myActiveTickets = useMemo(() => {
    if (!user) return [];
    return allTickets.filter((t: Ticket) => 
      t.name === user.name && 
      (t.status === 'Waiting' || t.status === 'Serving') &&
      t.tableType 
    );
  }, [allTickets, user]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          setLocation(currentLocation);
        }
      } catch (e) {
        console.log("Permission error");
      }
    })();
  }, []);

  useEffect(() => {
    if (location && user?.id) {
      dispatch(fetchPostsAsync({ 
        lat: location.coords.latitude, 
        lng: location.coords.longitude, 
        userId: user.id 
      }));
    } else {
      dispatch(fetchPostsAsync());
    }
  }, [location, user]);

  const processedData = useMemo(() => {
    let nearby: PartyActivity[] = [];
    let aiRecommended: PartyActivity[] = [];

    allActivities.forEach((act: PartyActivity) => {
      if (act.status !== 'open' && act.status !== 'Open') return;
      if (act.category !== activeFilter) return;
      if (searchQuery && !act.activity?.includes(searchQuery) && !act.name?.includes(searchQuery)) return;
      
      const distance = Number(act.distance) || 0;
      
      if (distance <= 10) {
        const matchRate = act.matchRate || 0;
        const isRecommended = act.isRecommended || false;
        
        const confirmedJoinedPax = act.joinedGuests?.filter((g: Guest) => g.status === 'confirmed').reduce((sum: number, g: Guest) => sum + g.pax, 0) || 0;
        
        let remainingSeats = 0;
        if (act.linkedTicket && act.linkedTicket.tableCapacity) {
          remainingSeats = act.linkedTicket.tableCapacity - act.linkedTicket.hostPax - confirmedJoinedPax;
        }

        const actWithDetails = { 
          ...act, 
          distance: distance.toFixed(1), 
          matchRate, 
          remainingSeats 
        };
        
        nearby.push(actWithDetails);
        if (isRecommended && act.hostId !== user?.id) aiRecommended.push(actWithDetails);
      }
    });

    return { nearby, aiRecommended: aiRecommended.sort((a, b) => (b.matchRate || 0) - (a.matchRate || 0)) };
  }, [allActivities, activeFilter, searchQuery, user]);

  const handleCreateActivity = () => {
    if (!user) return;
    if (!activityDesc || !selectedTicketId) {
      Alert.alert('แจ้งเตือน', 'กรุณาระบุรายละเอียดและเลือกคิวของคุณ');
      return;
    }

    const linkedTicket = myActiveTickets.find((t: Ticket) => t.id === selectedTicketId);
    if (!linkedTicket) return;

    const shop = places.find((p: Place) => p.id === linkedTicket.shopId);
    
    const tableInfo = shop?.tableTypes?.find((t: TableType) => t.id === linkedTicket.tableType);

    if (!tableInfo || tableInfo.capacity <= linkedTicket.guests) {
      Alert.alert('สร้างไม่ได้', 'โต๊ะที่คุณจองมีความจุพอดีกับจำนวนคนของคุณแล้ว ไม่มีที่ว่างให้เพื่อนร่วมโต๊ะครับ');
      return;
    }

    const newActivity: Partial<PartyActivity> = {
      hostId: user.id, 
      name: user.name, 
      activity: activityDesc,
      category: linkedTicket.service || 'ร้านอาหาร',
      avatar: 'https://i.pravatar.cc/150?u=me', 
      lat: location ? location.coords.latitude : 13.7563, 
      lng: location ? location.coords.longitude : 100.5018,
      linkedTicket: {
        shopId: linkedTicket.shopId || '',
        shopName: shop ? `${shop.name} (${shop.branch})` : 'Unknown Shop',
        bookTime: linkedTicket.bookTime,
        bookDate: linkedTicket.bookDate,
        tableType: linkedTicket.tableType || 'General',
        tableCapacity: tableInfo.capacity,
        hostPax: linkedTicket.guests
      },
      status: 'Open'
    };

    dispatch(addPostAsync(newActivity));
    Alert.alert('สำเร็จ', 'ประกาศหากิจกรรมของคุณถูกสร้างเรียบร้อยแล้ว');
    setIsCreateModalVisible(false);
    setActivityDesc('');
    setSelectedTicketId(null);
    setActiveFilter(linkedTicket.service || 'ร้านอาหาร');
  };

  const openJoinModal = (activity: PartyActivity) => {
    if (!user) return;
    if (activity.joinedGuests?.some((g: Guest) => g.userId === user.id) || activity.hostId === user.id) {
      router.push({ 
        pathname: '/page/Chat', 
        params: { friendName: activity.name, isHost: 'false', activityId: activity.id, guestId: user.id } 
      });
      return;
    }
    
    setSelectedActivityToJoin(activity);
    setJoinPax(1);
    setIsJoinModalVisible(true);
  };

  const submitJoinActivity = () => {
    if (!selectedActivityToJoin || !user) return;
    
    const remaining = selectedActivityToJoin.remainingSeats || 0;
    if (joinPax > remaining) {
      Alert.alert('ขออภัย', `จำนวนคนเกินที่ว่างครับ (เหลือว่างแค่ ${remaining} ที่)`);
      return;
    }

    const guestData: Guest = {
      userId: user.id, 
      userName: user.name, 
      pax: joinPax,
      status: 'pending'
    };

    dispatch(joinPostAsync({ 
      postId: selectedActivityToJoin.id, 
      guest: guestData
    }));

    Alert.alert('สำเร็จ', 'ส่งคำขอเข้าร่วมเรียบร้อยแล้ว! สามารถทักแชทหาโฮสต์ได้เลย');
    setIsJoinModalVisible(false);
  };

  const handleCloseActivity = (activityId: string) => {
    Alert.alert('ยืนยันปิดประกาศ', 'คุณแน่ใจหรือไม่ว่าได้คนครบแล้ว? (ประกาศจะหายไปจากหน้าค้นหา แต่ยังสามารถคุยในห้องแชทได้)', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ยืนยันคิวครบ', onPress: () => dispatch(updatePostStatus({ id: activityId, status: 'Closed' })) }
    ]);
  };

  const activeChats = allActivities.filter((act: PartyActivity) => act.hostId === user?.id || act.joinedGuests?.some((g: Guest) => g.userId === user?.id));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FAFC' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        <View style={{ paddingHorizontal: 20, paddingBottom: 16, backgroundColor: '#6FA4A1', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, zIndex: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}><ArrowLeft size={24} color="#FFFFFF" /></TouchableOpacity>
            <View>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' }}>หาเพื่อน</Text>
              <Text style={{ fontSize: 12, color: '#E6FFFA' }}>ค้นหาคนที่สนใจเหมือนคุณ</Text>
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#EDF2F7' }}>
              <Search size={20} color="#A0AEC0" />
              <TextInput style={{ flex: 1, marginLeft: 12, fontSize: 15, color: '#2D3748' }} placeholder="อยากทำกิจกรรมอะไร หรือ ค้นหาชื่อเพื่อน..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor="#A0AEC0" />
            </View>
          </View>

          <View style={{ paddingLeft: 20, marginTop: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['ร้านอาหาร', 'คาเฟ่', 'เสริมสวยอื่นๆ'].map(cat => (
                 <TouchableOpacity key={cat} onPress={() => setActiveFilter(cat)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, backgroundColor: activeFilter === cat ? '#6FA4A1' : '#FFFFFF', borderColor: activeFilter === cat ? '#6FA4A1' : '#E2E8F0' }}>
                   <Text style={{ fontSize: 14, fontWeight: '600', color: activeFilter === cat ? '#FFFFFF' : '#4A5568' }}>{cat}</Text>
                 </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={{ marginTop: 24, paddingLeft: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginBottom: 12 }}>AI แนะนำเพื่อนที่เข้ากันได้</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {processedData.aiRecommended.length > 0 ? processedData.aiRecommended.map((friend: PartyActivity) => (
                <View key={friend.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, width: 180, marginRight: 16, borderWidth: 1, borderColor: '#EDF2F7', overflow: 'hidden', paddingBottom: 16 }}>
                  <View style={{ height: 160, position: 'relative' }}>
                    <Image source={{ uri: friend.avatar || 'https://i.pravatar.cc/150' }} style={{ width: '100%', height: '100%' }} />
                    <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#6FA4A1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' }}>{friend.matchRate}% Match</Text>
                    </View>
                  </View>
                  <View style={{ paddingHorizontal: 12, paddingTop: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3748' }}>{friend.name}</Text>
                    <Text style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{friend.linkedTicket?.shopName}</Text>
                    <TouchableOpacity onPress={() => openJoinModal(friend)} style={{ marginTop: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1, backgroundColor: '#6FA4A1', borderColor: '#6FA4A1' }}>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' }}>ขอเข้าร่วม</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )) : <Text style={{ color: '#A0AEC0', fontStyle: 'italic', marginTop: 8 }}>ยังไม่มี AI แนะนำในหมวดหมู่นี้</Text>}
            </ScrollView>
          </View>

          <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3748' }}>ประกาศหาเพื่อน</Text>
              <TouchableOpacity onPress={() => setIsCreateModalVisible(true)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#6FA4A1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                <Plus size={16} color="#FFF" />
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', marginLeft: 4, fontSize: 13 }}>สร้างกิจกรรม</Text>
              </TouchableOpacity>
            </View>

            {processedData.nearby.length > 0 ? processedData.nearby.map((act: PartyActivity) => {
              const isHost = act.hostId === user?.id;
              const hasJoined = act.joinedGuests?.some((g: Guest) => g.userId === user?.id);
              
              return (
                <View key={act.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Image source={{ uri: act.avatar || 'https://i.pravatar.cc/150' }} style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#2D3748' }}>{act.name} {isHost && '(คุณ)'}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <MapPin size={12} color="#A0AEC0" />
                        <Text style={{ fontSize: 11, color: '#A0AEC0', marginLeft: 4 }}>{act.linkedTicket?.shopName} • {act.linkedTicket?.bookTime}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={{ fontSize: 14, color: '#4A5568', marginBottom: 12 }}>{act.activity}</Text>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F7FAFC', padding: 12, borderRadius: 12 }}>
                    <View>
                      <Text style={{ fontSize: 11, color: '#718096' }}>โควต้าโต๊ะ</Text>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#2D3748' }}>{act.linkedTicket?.hostPax} / {act.linkedTicket?.tableCapacity} คน</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 11, color: '#DD6B20', fontWeight: 'bold' }}>รับเพิ่ม</Text>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: '#DD6B20' }}>{act.remainingSeats} ท่าน</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', marginTop: 12 }}>
                    {isHost ? (
                      <TouchableOpacity onPress={() => handleCloseActivity(act.id)} style={{ flex: 1, backgroundColor: '#E53E3E', paddingVertical: 10, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                        <CheckCircle2 size={16} color="#FFF" style={{ marginRight: 6 }}/>
                        <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>ยืนยันคิวครบ (ปิดรับ)</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => openJoinModal(act)} style={{ flex: 1, backgroundColor: hasJoined ? '#EDF2F7' : '#6FA4A1', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}>
                        <Text style={{ color: hasJoined ? '#4A5568' : '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>{hasJoined ? 'เข้าห้องแชท' : 'ขอเข้าร่วม'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }) : <View style={{ alignItems: 'center', paddingVertical: 32 }}><Text style={{ color: '#A0AEC0' }}>ยังไม่มีโพสต์ในหมวดหมู่นี้</Text></View>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <TouchableOpacity 
        onPress={() => setIsChatListModalVisible(true)}
        style={{ position: 'absolute', bottom: 30, right: 20, backgroundColor: '#2D3748', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 5, elevation: 6 }}
      >
        <MessageCircle size={28} color="#FFFFFF" />
        {activeChats.length > 0 && (
          <View style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#E53E3E', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#2D3748' }}><Text style={{ color: '#FFF', fontSize: 9, fontWeight: 'bold' }}>{activeChats.length}</Text></View>
        )}
      </TouchableOpacity>

      <Modal visible={isCreateModalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '50%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2D3748' }}>สร้างกิจกรรมหาเพื่อน</Text>
              <TouchableOpacity onPress={() => setIsCreateModalVisible(false)}><X color="#4A5568" /></TouchableOpacity>
            </View>

            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#4A5568', marginBottom: 8 }}>รายละเอียดกิจกรรม</Text>
            <TextInput style={{ backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#EDF2F7', borderRadius: 12, padding: 16, fontSize: 15, color: '#2D3748', height: 100, textAlignVertical: 'top', marginBottom: 20 }} placeholder="เช่น หาคนหารชาบูจ้า คิวได้ตอนบ่ายสอง..." multiline value={activityDesc} onChangeText={setActivityDesc} />

            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#4A5568', marginBottom: 8 }}>เลือกคิวของคุณเพื่อเปิดแชร์</Text>
            <ScrollView style={{ maxHeight: 150, marginBottom: 24 }}>
              {myActiveTickets.length > 0 ? myActiveTickets.map((ticket: Ticket) => {
                const shop = places.find((p: Place) => p.id === ticket.shopId);
                const tableInfo = shop?.tableTypes?.find((t: TableType) => t.id === ticket.tableType);
                const isSelected = selectedTicketId === ticket.id;
                
                return (
                  <TouchableOpacity key={ticket.id} onPress={() => setSelectedTicketId(ticket.id)} style={{ padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 8, backgroundColor: isSelected ? '#E6FFFA' : '#FFFFFF', borderColor: isSelected ? '#38B2AC' : '#EDF2F7' }}>
                    <Text style={{ fontWeight: 'bold', color: '#2D3748' }}>{shop?.name}</Text>
                    <Text style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>เวลา: {ticket.bookTime} | คิว: {ticket.id}</Text>
                    <Text style={{ fontSize: 11, color: '#DD6B20', marginTop: 4, fontWeight: 'bold' }}>โต๊ะนั่งได้ {tableInfo?.capacity || '?'} คน (คุณจองไว้ {ticket.guests} คน)</Text>
                  </TouchableOpacity>
                );
              }) : <Text style={{ color: '#A0AEC0', fontStyle: 'italic', padding: 10 }}>คุณยังไม่มีคิวที่สามารถแชร์ได้ (ต้องระบุโต๊ะตอนจอง)</Text>}
            </ScrollView>

            <TouchableOpacity onPress={handleCreateActivity} style={{ backgroundColor: '#6FA4A1', paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>ประกาศหากิจกรรม</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isJoinModalVisible} animationType="fade" transparent={true}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2D3748', textAlign: 'center', marginBottom: 8 }}>เข้าร่วมปาร์ตี้</Text>
            <Text style={{ fontSize: 14, color: '#718096', textAlign: 'center', marginBottom: 24 }}>ร้าน {selectedActivityToJoin?.linkedTicket?.shopName}</Text>
            
            <View style={{ backgroundColor: '#FFF5F5', padding: 12, borderRadius: 12, marginBottom: 24, alignItems: 'center' }}>
              <Text style={{ color: '#C53030', fontWeight: 'bold' }}>รับได้อีกสูงสุด: {selectedActivityToJoin?.remainingSeats} ท่าน</Text>
            </View>

            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#4A5568', textAlign: 'center', marginBottom: 12 }}>คุณมากี่คน?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 32 }}>
              <TouchableOpacity onPress={() => setJoinPax(Math.max(1, joinPax - 1))} style={{ backgroundColor: '#F7FAFC', padding: 16, borderRadius: 16 }}><Minus size={24} color="#4A5568" /></TouchableOpacity>
              <View style={{ width: 80, alignItems: 'center' }}><Text style={{ fontSize: 32, fontWeight: '900', color: '#2D3748' }}>{joinPax}</Text></View>
              <TouchableOpacity onPress={() => setJoinPax(joinPax + 1)} style={{ backgroundColor: '#F7FAFC', padding: 16, borderRadius: 16 }}><Plus size={24} color="#4A5568" /></TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => setIsJoinModalVisible(false)} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#EDF2F7', alignItems: 'center' }}><Text style={{ fontWeight: 'bold', color: '#4A5568' }}>ยกเลิก</Text></TouchableOpacity>
              <TouchableOpacity onPress={submitJoinActivity} style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#6FA4A1', alignItems: 'center' }}><Text style={{ fontWeight: 'bold', color: '#FFFFFF' }}>ยืนยันส่งคำขอ</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isChatListModalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: '#F7FAFC', marginTop: Platform.OS === 'ios' ? 40 : 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#2D3748' }}>กล่องข้อความ (คำขอเข้าร่วม)</Text>
            <TouchableOpacity onPress={() => setIsChatListModalVisible(false)} style={{ padding: 4 }}><X size={24} color="#4A5568" /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {activeChats.length > 0 ? activeChats.map((chat: PartyActivity) => {
              const isMeHost = chat.hostId === user?.id;
              
              if (isMeHost) {
                return chat.joinedGuests?.map((guest: Guest) => (
                  <TouchableOpacity 
                    key={guest.userId} 
                    onPress={() => { 
                      setIsChatListModalVisible(false); 
                      router.push({ pathname: '/page/Chat', params: { friendName: guest.userName, isHost: 'true', activityId: chat.id, guestId: guest.userId } }); 
                    }} 
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 2 }}
                  >
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#E6FFFA', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                      <MessageCircle size={24} color="#38B2AC" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3748' }}>คำขอจาก: {guest.userName}</Text>
                      <Text style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>มา {guest.pax} ท่าน • ไปที่ {chat.linkedTicket?.shopName}</Text>
                    </View>
                  </TouchableOpacity>
                ));
              } else {
                const myRequest = chat.joinedGuests?.find((g: Guest) => g.userId === user?.id);
                return (
                  <TouchableOpacity 
                    key={chat.id} 
                    onPress={() => { 
                      setIsChatListModalVisible(false); 
                      router.push({ pathname: '/page/Chat', params: { friendName: chat.name, isHost: 'false', activityId: chat.id, guestId: user?.id } }); 
                    }} 
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 2 }}
                  >
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#E6FFFA', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                      <MessageCircle size={24} color="#38B2AC" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#2D3748' }}>ปาร์ตี้โฮสต์: {chat.name}</Text>
                      <Text style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>สถานะ: {myRequest?.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอการอนุมัติ'}</Text>
                    </View>
                  </TouchableOpacity>
                );
              }
            }) : <Text style={{ textAlign: 'center', color: '#A0AEC0', marginTop: 40 }}>ยังไม่มีคำขอในขณะนี้</Text>}
          </ScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}