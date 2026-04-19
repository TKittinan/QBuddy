import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Modal, Alert, SafeAreaView, KeyboardAvoidingView, Platform, StatusBar, RefreshControl } from 'react-native';
import { Search, Plus, Minus, X, ArrowLeft, MessageCircle, UserCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';

import { useAppSelector, useAppDispatch } from '../../redux/useRedux';
import { addPostAsync, joinPostAsync, fetchPostsAsync, updatePostStatus } from '../../redux/slices/postSlice';
import { API_BASE_URL } from "../../config";

import { PartyActivity, Ticket, Place, User, Guest, TableType } from '../../types';
import { RootState } from '../../redux'; 

export interface ExtendedPartyActivity extends PartyActivity {
  host?: { id?: string; name: string; avatarUrl?: string; interests?: string[]; successRate?: number };
  place?: { name: string; branch?: string | null };
  matchRate?: number;
  remainingSeats?: number;
}

export default function FindFriendsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch(); 
  
  const user: User | null = useAppSelector((state: RootState) => state.auth.user);
  const allActivities = useAppSelector((state: RootState) => state.post.posts as ExtendedPartyActivity[] || []);
  const allTickets: Ticket[] = useAppSelector((state: RootState) => state.queue.tickets || []);
  const places: Place[] = useAppSelector((state: RootState) => state.places.places || []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ทั้งหมด');
  const [refreshing, setRefreshing] = useState(false);
  
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [activityDesc, setActivityDesc] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [isJoinModalVisible, setIsJoinModalVisible] = useState(false);
  const [selectedActivityToJoin, setSelectedActivityToJoin] = useState<ExtendedPartyActivity | null>(null);
  const [joinPax, setJoinPax] = useState<number>(1);

  const [isChatListModalVisible, setIsChatListModalVisible] = useState(false);

  // 🌟 ดึงหมวดหมู่ที่มีในระบบจริง + เพิ่มหมวดหมู่ "ประกาศของฉัน"
  const dynamicCategories = useMemo(() => {
    const cats = new Set(allActivities.map(a => a.category));
    return ['ทั้งหมด', 'ประกาศของฉัน', ...Array.from(cats)];
  }, [allActivities]);

  const myActiveTickets = useMemo(() => {
    if (!user) return [];
    return allTickets.filter((t: Ticket) => 
      (t.name === user.name || t.email === user.email) && 
      (t.status === 'Waiting' || t.status === 'Serving') &&
      t.tableType 
    );
  }, [allTickets, user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchPostsAsync());
    setRefreshing(false);
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPostsAsync());
  }, [dispatch]);

  const processedData = useMemo(() => {
    let list: ExtendedPartyActivity[] = [];
    let aiRecommended: ExtendedPartyActivity[] = [];

    allActivities.forEach((act) => {
      // 🌟 กรองตาม Filter (ประกาศของฉัน / หมวดหมู่)
      if (activeFilter === 'ประกาศของฉัน') {
        if (act.hostId !== user?.id) return;
      } else if (activeFilter !== 'ทั้งหมด' && act.category !== activeFilter) {
        return;
      }

      const searchMatch = (act.title?.toLowerCase().includes(searchQuery.toLowerCase()) || act.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      if (searchQuery && !searchMatch) return;
      
      // 🌟 คำนวณที่ว่างจริงจากการจองที่โฮสต์ยืนยันแล้ว
      const confirmedPax = act.joinedGuests?.filter((g: Guest) => g.status === 'confirmed').reduce((sum, g) => sum + (g.pax || 0), 0) || 0;
      const remaining = Math.max(0, (act.maxGuests || 0) - confirmedPax);

      const actWithDetails = { ...act, remainingSeats: remaining };
      list.push(actWithDetails);

      // 🌟 AI แนะนำ: Match Rate >= 85% และ Host Success Rate >= 85%
      const hostRate = act.host?.successRate || 0;
      if (act.matchRate && act.matchRate >= 85 && hostRate >= 85 && act.hostId !== user?.id && act.status === 'Open') {
        aiRecommended.push(actWithDetails);
      }
    });

    return { list, aiRecommended: aiRecommended.sort((a, b) => (Number(b.matchRate) || 0) - (Number(a.matchRate) || 0)) };
  }, [allActivities, activeFilter, searchQuery, user]);

  const handleCreateActivity = () => {
    if (!user) return;
    if (!activityDesc || !selectedTicketId) return Alert.alert('แจ้งเตือน', 'กรุณาระบุรายละเอียดและเลือกคิว');

    const linkedTicket = allTickets.find(t => t.id === selectedTicketId);
    const shop = places.find(p => p.id === linkedTicket?.shopId || p.id === linkedTicket?.placeId);
    // 🌟 แก้ไข: เทียบด้วย label เพราะ Ticket เก็บชื่อประเภทโต๊ะไว้
    const tableInfo = shop?.tableTypes?.find(t => t.label === linkedTicket?.tableType);

    if (!tableInfo || tableInfo.capacity <= (linkedTicket?.guests || 0)) {
      return Alert.alert('สร้างไม่ได้', 'โต๊ะที่คุณจองมีความจุพอดีกับจำนวนคนของคุณแล้ว ไม่มีที่ว่างให้เพื่อนร่วมโต๊ะครับ');
    }

    const newActivity: Partial<PartyActivity> = {
      title: `ไป ${shop?.name || 'ร้านอาหาร'}`,
      description: activityDesc,
      category: linkedTicket?.service || 'ร้านอาหาร',
      meetingDate: linkedTicket?.bookDate,
      meetingTime: linkedTicket?.bookTime,
      maxGuests: tableInfo.capacity - (linkedTicket?.guests || 0),
      status: 'Open',
      hostId: user.id,
      placeId: shop?.id,
      lat: 0, lng: 0 // ไม่ใช้ระยะทางแล้ว
    };

    dispatch(addPostAsync(newActivity as PartyActivity));
    setIsCreateModalVisible(false);
    setActivityDesc('');
  };

  // 🌟 ฟังก์ชันสำหรับให้ Host กดยืนยันสมาชิกจากหน้ารายการแชท
  const handleConfirmGuest = async (activityId: string, guestUserId: string) => {
    try {
      await axios.post(`${API_BASE_URL}/posts/confirm-guest`, { activityId, userId: guestUserId });
      Alert.alert('สำเร็จ', 'ยืนยันเพื่อนร่วมโต๊ะเรียบร้อยแล้ว');
      dispatch(fetchPostsAsync());
    } catch (e) {
      Alert.alert('ผิดพลาด', 'ไม่สามารถยืนยันสมาชิกได้');
    }
  };

  const activeChats = allActivities.filter(act => act.hostId === user?.id || act.joinedGuests?.some(g => g.userId === user?.id));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7FAFC' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ padding: 20, backgroundColor: '#6FA4A1', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#FFFFFF" /></TouchableOpacity>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' }}>หาเพื่อน</Text>
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6FA4A1" colors={["#6FA4A1"]} />}>
          
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#EDF2F7' }}>
              <Search size={20} color="#A0AEC0" />
              <TextInput style={{ flex: 1, marginLeft: 12, fontSize: 15 }} placeholder="ค้นหาประกาศ..." value={searchQuery} onChangeText={setSearchQuery} />
            </View>
          </View>

          <View style={{ paddingLeft: 20, marginTop: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dynamicCategories.map(cat => (
                 <TouchableOpacity key={cat} onPress={() => setActiveFilter(cat)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, backgroundColor: activeFilter === cat ? '#6FA4A1' : '#FFFFFF', borderColor: activeFilter === cat ? '#6FA4A1' : '#E2E8F0' }}>
                   <Text style={{ fontSize: 14, fontWeight: '600', color: activeFilter === cat ? '#FFFFFF' : '#4A5568' }}>{cat}</Text>
                 </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* AI แนะนำ */}
          <View style={{ marginTop: 24, paddingLeft: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>AI แนะนำ (Match % สูง + สำเร็จเยอะ)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {processedData.aiRecommended.map((friend) => (
                <View key={friend.id} style={{ backgroundColor: '#FFF', borderRadius: 16, width: 180, marginRight: 16, borderWidth: 1, borderColor: '#EDF2F7', paddingBottom: 16 }}>
                  <Image source={{ uri: friend.host?.avatarUrl || 'https://i.pravatar.cc/150' }} style={{ width: '100%', height: 120, borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                  <View style={{ padding: 12 }}>
                    <Text style={{ fontWeight: 'bold' }}>{friend.host?.name}</Text>
                    <Text style={{ color: '#38A169', fontSize: 11 }}>Match {friend.matchRate}%</Text>
                    <TouchableOpacity onPress={() => { setSelectedActivityToJoin(friend); setJoinPax(1); setIsJoinModalVisible(true); }} style={{ marginTop: 8, backgroundColor: '#6FA4A1', paddingVertical: 6, borderRadius: 8, alignItems: 'center' }}>
                      <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>ขอเข้าร่วม</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>ประกาศทั้งหมด</Text>
              <TouchableOpacity onPress={() => setIsCreateModalVisible(true)} style={{ backgroundColor: '#6FA4A1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>+ สร้างกิจกรรม</Text>
              </TouchableOpacity>
            </View>

            {processedData.list.map((act) => (
              <View key={act.id} style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7', opacity: act.status === 'Closed' ? 0.6 : 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Image source={{ uri: act.host?.avatarUrl || 'https://i.pravatar.cc/150' }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold' }}>{act.host?.name} {act.hostId === user?.id && '(คุณ)'}</Text>
                    <Text style={{ fontSize: 11, color: '#A0AEC0' }}>{act.place?.name} • {act.meetingTime}</Text>
                  </View>
                  {act.status === 'Closed' && <View style={{ backgroundColor: '#FED7D7', padding: 4, borderRadius: 4 }}><Text style={{ color: '#C53030', fontSize: 10, fontWeight: 'bold' }}>เต็มแล้ว</Text></View>}
                </View>
                <Text style={{ fontSize: 14, color: '#4A5568' }}>{act.description}</Text>
                <View style={{ marginTop: 10, backgroundColor: '#F7FAFC', padding: 8, borderRadius: 8 }}>
                  {/* 🌟 แสดงจำนวนที่ว่างจริงที่คำนวณมาแล้ว */}
                  <Text style={{ fontSize: 12 }}>ที่นั่งว่างสำหรับเพื่อน: <Text style={{ fontWeight: 'bold', color: '#DD6B20' }}>{act.remainingSeats} ท่าน</Text></Text>
                </View>
                <TouchableOpacity onPress={() => { setSelectedActivityToJoin(act); setJoinPax(1); setIsJoinModalVisible(true); }} disabled={act.status === 'Closed'} style={{ marginTop: 12, backgroundColor: act.status === 'Closed' ? '#EDF2F7' : '#6FA4A1', paddingVertical: 10, borderRadius: 10, alignItems: 'center' }}>
                  <Text style={{ color: act.status === 'Closed' ? '#A0AEC0' : '#FFF', fontWeight: 'bold' }}>
                    {act.hostId === user?.id ? 'จัดการประกาศ' : act.joinedGuests?.some(g => g.userId === user?.id) ? 'เข้าห้องแชท' : 'ขอเข้าร่วม'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <TouchableOpacity onPress={() => setIsChatListModalVisible(true)} style={{ position: 'absolute', bottom: 30, right: 20, backgroundColor: '#2D3748', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 }}>
        <MessageCircle size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal ยืนยันเข้าร่วมพร้อมระบุจำนวนคน */}
      <Modal visible={isJoinModalVisible} transparent animationType="fade">
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 20 }}>
          <View style={{ backgroundColor: '#FFF', borderRadius: 24, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>เข้าร่วมปาร์ตี้</Text>
            <Text style={{ textAlign: 'center', marginVertical: 10 }}>ว่าง {selectedActivityToJoin?.remainingSeats} ที่นั่ง</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 20 }}>
              <TouchableOpacity onPress={() => setJoinPax(Math.max(1, joinPax - 1))} style={{ padding: 15, backgroundColor: '#F7FAFC', borderRadius: 12 }}><Minus size={20}/></TouchableOpacity>
              <Text style={{ fontSize: 24, fontWeight: 'bold', marginHorizontal: 30 }}>{joinPax}</Text>
              <TouchableOpacity onPress={() => setJoinPax(joinPax + 1)} style={{ padding: 15, backgroundColor: '#F7FAFC', borderRadius: 12 }}><Plus size={20}/></TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => {
              if(joinPax > (selectedActivityToJoin?.remainingSeats || 0)) return Alert.alert('ที่นั่งไม่พอ');
              dispatch(joinPostAsync({ activity_id: selectedActivityToJoin?.id || '', user_id: user?.id || '', pax: joinPax }));
              setIsJoinModalVisible(false);
            }} style={{ backgroundColor: '#6FA4A1', padding: 16, borderRadius: 16, alignItems: 'center' }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>ยืนยันส่งคำขอ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsJoinModalVisible(false)} style={{ marginTop: 15, alignItems: 'center' }}><Text style={{ color: '#A0AEC0' }}>ยกเลิก</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal รายการแชทและการยืนยันของ Host */}
      <Modal visible={isChatListModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#F7FAFC' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>คำขอเข้าร่วม</Text>
            <TouchableOpacity onPress={() => setIsChatListModalVisible(false)}><X size={24}/></TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }}>
            {activeChats.map((chat) => (
              <View key={chat.id}>
                {chat.hostId === user?.id ? (
                  chat.joinedGuests?.map(guest => (
                    <View key={guest.userId} style={{ backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold' }}>ผู้ขอเข้าร่วม ({guest.pax} คน)</Text>
                        <Text style={{ fontSize: 12, color: '#718096' }}>ร้าน: {chat.place?.name}</Text>
                      </View>
                      {guest.status === 'pending' ? (
                        <TouchableOpacity onPress={() => handleConfirmGuest(chat.id, guest.userId)} style={{ backgroundColor: '#38A169', padding: 8, borderRadius: 8 }}>
                          <UserCheck size={20} color="#FFF"/>
                        </TouchableOpacity>
                      ) : (
                        <Text style={{ color: '#38A169', fontWeight: 'bold' }}>ยืนยันแล้ว</Text>
                      )}
                      <TouchableOpacity style={{ marginLeft: 10 }} onPress={() => { setIsChatListModalVisible(false); router.push({ pathname: '/page/Chat', params: { friendName: 'Guest', activityId: chat.id, guestId: guest.userId } }); }}>
                        <MessageCircle size={24} color="#6FA4A1"/>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <TouchableOpacity onPress={() => { setIsChatListModalVisible(false); router.push({ pathname: '/page/Chat', params: { friendName: chat.host?.name, activityId: chat.id, guestId: user?.id } }); }} style={{ backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12 }}>
                    <Text style={{ fontWeight: 'bold' }}>ปาร์ตี้ของ {chat.host?.name}</Text>
                    <Text style={{ fontSize: 12 }}>สถานะ: {chat.joinedGuests?.find(g => g.userId === user?.id)?.status === 'confirmed' ? 'รับเข้ากลุ่มแล้ว' : 'รอการยืนยัน'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Modal สร้างกิจกรรม (UI เดิม) */}
      <Modal visible={isCreateModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '70%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>สร้างกิจกรรมหาเพื่อน</Text>
              <TouchableOpacity onPress={() => setIsCreateModalVisible(false)}><X/></TouchableOpacity>
            </View>
            <TextInput multiline style={{ backgroundColor: '#F7FAFC', borderRadius: 12, padding: 16, height: 100, textAlignVertical: 'top' }} placeholder="รายละเอียด..." value={activityDesc} onChangeText={setActivityDesc} />
            <Text style={{ fontWeight: 'bold', marginVertical: 15 }}>เลือกคิวที่ต้องการแชร์</Text>
            <ScrollView>
              {myActiveTickets.map(ticket => (
                <TouchableOpacity key={ticket.id} onPress={() => setSelectedTicketId(ticket.id)} style={{ padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 8, backgroundColor: selectedTicketId === ticket.id ? '#E6FFFA' : '#FFF', borderColor: selectedTicketId === ticket.id ? '#38B2AC' : '#EDF2F7' }}>
                  <Text style={{ fontWeight: 'bold' }}>{places.find(p => p.id === ticket.shopId || p.id === ticket.placeId)?.name}</Text>
                  <Text style={{ fontSize: 12 }}>คิว: {ticket.id} | ประเภท: {ticket.tableType}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={handleCreateActivity} style={{ backgroundColor: '#6FA4A1', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 20 }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>ประกาศหากิจกรรม</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}