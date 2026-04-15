import React, { useState, useMemo } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, Modal, Alert, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { ArrowLeft, Send, Check, X, Users, AlertCircle } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Stepper } from '../../components/ui/Stepper';
import { Button } from '../../components/ui/Button'; 

import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { bookTicket } from '../../redux/slices/queueSlice';
import { confirmGuest, removeGuest, Activity, Guest } from '../../redux/slices/friendSlice';
import { addChatMessage, ChatMessage } from '../../redux/slices/chatSlice'; 
import { useQueue } from '../../hooks/useQueue';

interface ChatRootState {
  friends: { allActivities: Activity[] };
  chat: { messages: ChatMessage[] };
}

export default function ChatPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { generateTicketId } = useQueue();
  
  const { friendName, isHost, activityId, guestId } = useLocalSearchParams();
  const isHostUser = isHost === 'true';
  const targetGuestId = guestId as string;
  
  const allActivities = useAppSelector((state: ChatRootState) => state.friends.allActivities);
  const activity = allActivities.find((a: Activity) => a.id === activityId);
  const guest = activity?.joinedGuests?.find((g: Guest) => g.userId === targetGuestId);

  const chatLog = useAppSelector((state: ChatRootState) => state.chat.messages);
  const [message, setMessage] = useState('');

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [joinerCount, setJoinerCount] = useState(1);
  
  const missingSpots = useMemo(() => {
    if (!activity || !activity.linkedTicket) return 0; 
    const confirmedPax = activity.joinedGuests?.filter((g: Guest) => g.status === 'confirmed').reduce((sum: number, g: Guest) => sum + g.pax, 0) || 0;
    return activity.linkedTicket.tableCapacity - activity.linkedTicket.hostPax - confirmedPax;
  }, [activity]);

  const handleSend = () => {
    if (!message.trim()) return;
    dispatch(addChatMessage({ id: Date.now(), sender: 'me', text: message }));
    setMessage('');
  };

  const handleConfirmJoin = () => {
    if (!guest || !activity) return;
    
    if (guest.pax > missingSpots) {
      Alert.alert('คนเกินจำนวน', `คุณรับคนได้อีกแค่ ${missingSpots} คนเท่านั้น แต่เขาขอมา ${guest.pax} คนครับ\nกรุณาเจรจาหรือปฏิเสธคำขอ`);
      return;
    }
    
    dispatch(confirmGuest({ activityId: activity.id, userId: guest.userId }));

    const newTicketId = generateTicketId(activity.linkedTicket.shopId, activity.linkedTicket.bookDate.split('T')[0]);
    
    dispatch(bookTicket({
      id: newTicketId,
      name: guest.userName, 
      service: activity.category,
      shopId: activity.linkedTicket.shopId,
      status: 'Waiting',
      createdAt: new Date().toISOString(),
      bookDate: activity.linkedTicket.bookDate,
      bookTime: activity.linkedTicket.bookTime,
      tableType: activity.linkedTicket.tableType,
      guests: guest.pax
    }));

    Alert.alert('สำเร็จ', 'ยืนยันรับเข้ากลุ่มเรียบร้อยแล้ว บัตรคิวถูกส่งไปยังผู้เข้าร่วมแล้ว');
    setIsConfirmModalVisible(false);
  };

  const handleCancelJoin = () => {
    if (!activity || !guest) return;
    Alert.alert('ยืนยันการยกเลิก', isHostUser ? 'คุณต้องการปฏิเสธคำขอนี้ใช่หรือไม่?' : 'คุณต้องการยกเลิกคำขอเข้าร่วมใช่หรือไม่?', [
      { text: 'ไม่', style: 'cancel' },
      { 
        text: 'ใช่, ยกเลิกเลย', 
        style: 'destructive',
        onPress: () => {
          dispatch(removeGuest({ activityId: activity.id, userId: guest.userId }));
          Alert.alert('ยกเลิกสำเร็จ', '', [{ text: 'ตกลง', onPress: () => router.back() }]);
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, padding: 4 }}>
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{friendName || 'แชท'}</Text>
          </View>
          
          {isHostUser && (
            <Button 
              title="ยืนยันรับเข้าตี้" 
              variant="primary" 
              icon={<Check size={16} color="#FFFFFF" />}
              onPress={() => setIsConfirmModalVisible(true)}
              style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#38A169', borderRadius: 16 }}
            />
          )}
        </View>

        {guest && guest.status === 'pending' && (
          <View style={styles.actionBanner}>
            <View style={styles.bannerInfoRow}>
              <AlertCircle size={20} color="#DD6B20" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.bannerTitle}>
                  {isHostUser ? `คำขอเข้าร่วมจาก ${guest.userName}` : 'สถานะ: รอโฮสต์ยืนยัน'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                  <Users size={14} color="#718096" />
                  <Text style={styles.bannerSubtitle}> จำนวนที่ระบุ: <Text style={{fontWeight: '800', color: '#2D3748'}}>{guest.pax} ท่าน</Text></Text>
                </View>
              </View>
            </View>

            <View style={styles.bannerActionRow}>
              <View style={{ flex: 1 }}>
                <Button 
                  title={isHostUser ? 'ปฏิเสธ' : 'ยกเลิกคำขอ'} 
                  variant="outline" 
                  icon={<X size={16} color="#E53E3E" />}
                  onPress={handleCancelJoin}
                  style={{ borderColor: '#FED7D7', backgroundColor: '#FFF5F5', paddingVertical: 10 }}
                />
              </View>

              {isHostUser && (
                <View style={{ flex: 1 }}>
                  <Button 
                    title="รับเข้าตี้" 
                    variant="primary" 
                    icon={<Check size={16} color="#FFFFFF" />}
                    onPress={handleConfirmJoin}
                    style={{ paddingVertical: 10 }}
                  />
                </View>
              )}
            </View>
          </View>
        )}

        {guest && guest.status === 'confirmed' && (
          <View style={styles.successBanner}>
            <Check size={20} color="#38A169" />
            <Text style={styles.successBannerText}>เข้าร่วมปาร์ตี้สำเร็จแล้ว ({guest.pax} ท่าน)</Text>
          </View>
        )}

        <ScrollView style={styles.chatArea}>
          {chatLog.map((msg: ChatMessage) => {
            const isMe = msg.sender === 'me';
            return (
              <View key={msg.id} style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowFriend]}>
                <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleFriend]}>
                  <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{msg.text}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="พิมพ์ข้อความ..."
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#A0AEC0"
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      <Modal visible={isConfirmModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>ระบุจำนวนคนที่เข้าร่วม</Text>
              <TouchableOpacity onPress={() => setIsConfirmModalVisible(false)}>
                <X color="#4A5568" />
              </TouchableOpacity>
            </View>

            <Text style={styles.missingSpotsInfo}>โต๊ะนี้ขาดคนอีกจำนวน: {missingSpots} คน</Text>

            <View style={styles.stepperWrapper}>
              <Stepper 
                value={joinerCount} 
                onValueChange={setJoinerCount} 
                min={1} 
                size="large" 
              />
            </View>

            <Button 
              title="ยืนยันข้อมูลและส่งคิว" 
              variant="primary" 
              onPress={handleConfirmJoin}
              style={{ width: '100%', paddingVertical: 16 }}
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748' },
  
  actionBanner: { backgroundColor: '#FFFAF0', padding: 16, borderBottomWidth: 1, borderBottomColor: '#FBD38D' },
  bannerInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: '#DD6B20' },
  bannerSubtitle: { fontSize: 13, color: '#718096' },
  bannerActionRow: { flexDirection: 'row', gap: 12 },

  successBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDF4', padding: 12, borderBottomWidth: 1, borderBottomColor: '#C6F6D5' },
  successBannerText: { color: '#2F855A', fontSize: 14, fontWeight: '800', marginLeft: 8 },

  chatArea: { flex: 1, backgroundColor: '#F7FAFC', padding: 16 },
  messageRow: { maxWidth: '80%', marginBottom: 12 },
  messageRowMe: { alignSelf: 'flex-end' },
  messageRowFriend: { alignSelf: 'flex-start' },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
  messageBubbleMe: { backgroundColor: '#6FA4A1', borderBottomRightRadius: 4 },
  messageBubbleFriend: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#EDF2F7' },
  messageText: { fontSize: 15, color: '#2D3748', lineHeight: 22 },
  messageTextMe: { color: '#FFFFFF' },

  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#EDF2F7', backgroundColor: '#FFFFFF' },
  textInput: { flex: 1, backgroundColor: '#F7FAFC', borderRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: '#2D3748', borderWidth: 1, borderColor: '#EDF2F7' },
  sendBtn: { marginLeft: 12, backgroundColor: '#6FA4A1', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },

  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748' },
  missingSpotsInfo: { fontSize: 14, color: '#718096', marginBottom: 24, alignSelf: 'flex-start' },
  stepperWrapper: { alignItems: 'center', marginBottom: 32 },
});