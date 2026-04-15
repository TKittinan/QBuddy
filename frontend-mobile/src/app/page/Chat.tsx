import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, Platform, StatusBar, ScrollView, KeyboardAvoidingView, Modal, Alert, StyleSheet } from 'react-native';
import { ArrowLeft, Send, Check, X } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Stepper } from '../../components/ui/Stepper';

export default function ChatPage() {
  const router = useRouter();
  const { friendName } = useLocalSearchParams();
  const [message, setMessage] = useState('');
  
  const [chatLog, setChatLog] = useState([
    { id: 1, sender: 'friend', text: `สวัสดีครับ ขอหารคิวด้วยคนครับ ไปกี่คนครับเนี่ย?` },
    { id: 2, sender: 'me', text: `มา 2 คนครับ ขาดอีก 2 คนพอดี` }
  ]);

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [joinerCount, setJoinerCount] = useState(1);
  const missingSpots = 2;

  const handleSend = () => {
    if (!message.trim()) return;
    setChatLog([...chatLog, { id: Date.now(), sender: 'me', text: message }]);
    setMessage('');
  };

  const handleConfirmJoin = () => {
    if (joinerCount > missingSpots) {
      Alert.alert('คนเกินจำนวน', `คุณรับคนได้อีกแค่ ${missingSpots} คนเท่านั้น กรุณาปรับลดจำนวนลง`);
      return;
    }
    
    if (joinerCount === missingSpots) {
      Alert.alert('คิวครบแล้ว', 'คนครบตามจำนวนที่ขาดแล้ว ระบบจะทำการปิดรับคนเพิ่มและยืนยันคิวให้ทันที');
      setIsConfirmModalVisible(false);
      return;
    }

    Alert.alert('สำเร็จ', 'ยืนยันรับเข้ากลุ่มเรียบร้อยแล้ว');
    setIsConfirmModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{friendName || 'เพื่อนใหม่'}</Text>
          </View>
          
          <TouchableOpacity onPress={() => setIsConfirmModalVisible(true)} style={styles.confirmHeaderBtn}>
            <Check size={16} color="#FFFFFF" />
            <Text style={styles.confirmHeaderBtnText}>ยืนยันรับเข้าตี้</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.chatArea}>
          {chatLog.map((msg) => {
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

            <Text style={styles.missingSpotsInfo}>คุณขาดคนอีกจำนวน: {missingSpots} คน</Text>

            <View style={styles.stepperWrapper}>
              <Stepper 
                value={joinerCount} 
                onValueChange={setJoinerCount} 
                min={1} 
                size="large" 
              />
            </View>

            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmJoin}>
              <Text style={styles.modalConfirmBtnText}>ยืนยันข้อมูล</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748' },
  confirmHeaderBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#38A169', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  confirmHeaderBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginLeft: 4 },
  
  chatArea: { flex: 1, backgroundColor: '#F7FAFC', padding: 16 },
  messageRow: { maxWidth: '80%', marginBottom: 12 },
  messageRowMe: { alignSelf: 'flex-end' },
  messageRowFriend: { alignSelf: 'flex-start' },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 },
  messageBubbleMe: { backgroundColor: '#6FA4A1', borderBottomRightRadius: 4 },
  messageBubbleFriend: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#EDF2F7' },
  messageText: { fontSize: 15, color: '#2D3748' },
  messageTextMe: { color: '#FFFFFF' },

  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#EDF2F7', backgroundColor: '#FFFFFF' },
  textInput: { flex: 1, backgroundColor: '#F7FAFC', borderRadius: 20, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 15, color: '#2D3748', borderWidth: 1, borderColor: '#EDF2F7' },
  sendBtn: { marginLeft: 12, backgroundColor: '#6FA4A1', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748' },
  missingSpotsInfo: { fontSize: 14, color: '#718096', marginBottom: 24, alignSelf: 'flex-start' },
  
  stepperWrapper: { alignItems: 'center', marginBottom: 32 },
  modalConfirmBtn: { backgroundColor: '#6FA4A1', paddingVertical: 16, borderRadius: 16, width: '100%', alignItems: 'center' },
  modalConfirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});