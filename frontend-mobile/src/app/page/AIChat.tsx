import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, SafeAreaView, Platform, KeyboardAvoidingView, StatusBar } from 'react-native';
import { ArrowLeft, Send, MapPin } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useAppSelector, useAppDispatch } from '../../redux/useRedux';
import { addMessage, fetchAiHistoryAsync } from '../../redux/slices/aichatSlice';

interface PlaceCardType {
  name: string;
  distance: string;
  category: string;
  image: string;
}

interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  text: string;
  placeCard?: PlaceCardType;
}

export default function AIChatScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { initialMessage } = useLocalSearchParams();
  
  // 🌟 ดึงข้อมูลจาก Redux แบบดักจับ Array
  const aiChatState = useAppSelector((state: any) => state.aichat);
  const rawMessages = aiChatState?.messages?.data || aiChatState?.messages || [];
  const messages = Array.isArray(rawMessages) ? rawMessages : [];
  
  // 🌟 ดึง User ปัจจุบัน
  const user = useAppSelector((state: any) => state.auth?.user);

  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // โหลดประวัติแชทเมื่อเข้าหน้า
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAiHistoryAsync(user.id));
    }
  }, [user]);

  // ส่งข้อความเริ่มต้น (ถ้ามาจากหน้า Home)
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      dispatch(addMessage({ id: Date.now().toString(), type: 'user', text: initialMessage as string }));
      // 🌟 สั่งให้ AI ส่งข้อความตอบกลับโดยดึงร้านจากฐานข้อมูลมา (อันนี้เป็น Logic จำลองชั่วคราว)
      setTimeout(() => {
        dispatch(addMessage({ 
          id: (Date.now()+1).toString(), 
          type: 'ai', 
          text: 'นี่คือร้านอาหารใกล้คุณที่คุณอาจจะชอบครับ',
          placeCard: {
            name: "Copper Beyond Buffet",
            distance: "0.8 กม.",
            category: "ร้านอาหาร",
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500"
          }
        }));
      }, 1000);
    }
  }, [initialMessage]);

  const handleSend = () => {
    if (inputText.trim().length === 0) return;
    
    dispatch(addMessage({ id: Date.now().toString(), type: 'user', text: inputText }));
    setInputText('');
    
    // จำลองการตอบกลับของ AI (ในระบบจริง ตรงนี้จะยิง API ไปหา Backend เพื่อขอ AI Generate ข้อความ)
    setTimeout(() => {
      dispatch(addMessage({
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: 'รับทราบครับ ผมบันทึกข้อมูลไว้แล้ว สนใจจองคิวเลยไหมครับ?'
      }));
    }, 1500);
  };

  const handleBookPlace = (placeName: string) => {
    router.push({ pathname: '/page/PlaceDetail', params: { id: 'p1' } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}><ArrowLeft size={24} color="#2D3748" /></TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>QBuddy AI</Text>
            <View style={styles.onlineDot} />
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatContainer} 
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={styles.timeTag}><Text style={styles.timeText}>วันนี้</Text></View>
          
          <View style={[styles.messageRow, { justifyContent: 'flex-start' }]}>
            <View style={[styles.bubble, styles.aiBubble]}>
              <Text style={[styles.bubbleText, { color: '#2D3748' }]}>
                สวัสดีครับ ผม QBuddy AI ผู้ช่วยส่วนตัวของคุณ วันนี้อยากให้ผมแนะนำร้านอาหาร คาเฟ่ หรือหากิจกรรมอะไรทำดีครับ? 😊
              </Text>
            </View>
          </View>

          {messages.map((msg: AIMessage) => {
            const isUser = msg.type === 'user';
            return (
              <View key={msg.id} style={[styles.messageRow, { justifyContent: isUser ? 'flex-end' : 'flex-start' }]}>
                <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.bubbleText, { color: isUser ? '#FFFFFF' : '#2D3748' }]}>{msg.text}</Text>
                  
                  {!isUser && msg.placeCard && (
                    <View style={styles.aiCard}>
                      <Image source={{ uri: msg.placeCard.image }} style={styles.aiCardImg} />
                      <View style={styles.aiCardBody}>
                        <Text style={styles.aiCardTitle}>{msg.placeCard.name}</Text>
                        <View style={styles.aiCardInfoRow}>
                          <MapPin size={12} color="#718096" />
                          <Text style={styles.aiCardInfoText}>{msg.placeCard.distance} • {msg.placeCard.category}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleBookPlace(msg.placeCard!.name)} style={styles.bookBtn}>
                          <Text style={styles.bookBtnText}>จองคิวร้านนี้</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.bottomArea}>
          <View style={styles.inputContainer}>
            <TextInput 
              style={styles.textInput} 
              placeholder="พิมพ์ข้อความที่นี่..." 
              placeholderTextColor="#A0AEC0"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, inputText.trim().length > 0 ? styles.sendBtnActive : styles.sendBtnInactive]}
              onPress={handleSend}
              disabled={inputText.trim().length === 0}
            >
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7FAFC' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EDF2F7', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 3, zIndex: 10 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginRight: 6 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#48BB78' },
  chatContainer: { flex: 1 },
  chatContent: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 20 },
  timeTag: { alignSelf: 'center', backgroundColor: '#EDF2F7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 20 },
  timeText: { fontSize: 11, color: '#718096', fontWeight: '600' },
  messageRow: { flexDirection: 'row', marginBottom: 16, width: '100%' },
  bubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  userBubble: { backgroundColor: '#6FA4A1', borderTopRightRadius: 4, alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#E2E8F0', borderTopLeftRadius: 4, alignSelf: 'flex-start' },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  aiCard: { backgroundColor: '#FFF', borderRadius: 20, marginTop: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, width: 260 },
  aiCardImg: { width: '100%', height: 120 },
  aiCardBody: { padding: 16 },
  aiCardTitle: { fontSize: 16, fontWeight: '800', color: '#2D3748', marginBottom: 4 },
  aiCardInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  aiCardInfoText: { fontSize: 12, color: '#718096', marginLeft: 4 },
  bookBtn: { backgroundColor: '#6FA4A1', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  bookBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  bottomArea: { backgroundColor: '#F7FAFC', paddingBottom: Platform.OS === 'ios' ? 20 : 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 10, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  textInput: { flex: 1, minHeight: 36, maxHeight: 100, fontSize: 15, color: '#2D3748', paddingTop: Platform.OS === 'ios' ? 10 : 8, paddingBottom: Platform.OS === 'ios' ? 10 : 8 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 12, marginBottom: 2 },
  sendBtnActive: { backgroundColor: '#6FA4A1' },
  sendBtnInactive: { backgroundColor: '#CBD5E0' }
});