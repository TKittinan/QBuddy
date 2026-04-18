import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, SafeAreaView, Platform, KeyboardAvoidingView, StatusBar } from 'react-native';
import { ArrowLeft, Send, MapPin } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { addMessage } from '../../redux/slices/aichatSlice';

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

interface AIRootState {
  aichat: { messages: AIMessage[] }; 
}

export default function AIChatScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { initialMessage } = useLocalSearchParams();
  
  const messages = useAppSelector((state: AIRootState) => state.aichat?.messages || []);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      dispatch(addMessage({ id: Date.now().toString(), type: 'user', text: initialMessage as string }));

      setTimeout(() => {
        dispatch(addMessage({ 
          id: (Date.now() + 1).toString(), 
          type: 'ai', 
          text: 'จากประวัติการจองของคุณ นี่คือร้านคิวว่างใกล้ๆ ครับ:',
          placeCard: { name: 'Copper Beyond Buffet', distance: '0.8 km', category: 'Steakhouse', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500' }
        }));
      }, 1000);
    }
  }, [initialMessage]);

  const handleSend = () => {
    if (inputText.trim().length > 0) {
      dispatch(addMessage({ id: Date.now().toString(), type: 'user', text: inputText }));
      setInputText('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><ArrowLeft size={24} color="#1F2937" /></TouchableOpacity>
        <Text style={styles.headerTitle}>AI Chat</Text>
        <View style={{ width: 24 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.chatContainer}>
          {messages.map((msg: AIMessage) => (
            <View key={msg.id} style={msg.type === 'user' ? styles.userMsgRow : styles.aiMsgRow}>
              {msg.type === 'ai' && <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png' }} style={styles.avatarAi} />}
              <View style={{ flex: 1 }}>
                <View style={[styles.bubble, msg.type === 'user' ? styles.userBubble : styles.aiBubble]}>
                  <Text style={[styles.bubbleText, msg.type === 'user' ? { color: '#FFF' } : { color: '#2D3748' }]}>{msg.text}</Text>
                </View>
                
                {msg.placeCard && (
                  <View style={styles.aiCard}>
                    <Image source={{ uri: msg.placeCard.image }} style={styles.aiCardImg} />
                    <View style={styles.aiCardBody}>
                      <Text style={styles.aiCardTitle}>{msg.placeCard.name}</Text>
                      <View style={styles.aiCardInfoRow}>
                        <MapPin size={12} color="#718096" />
                        <Text style={styles.aiCardInfoText}>{msg.placeCard.distance} • {msg.placeCard.category}</Text>
                      </View>
                      <TouchableOpacity style={styles.bookBtn}>
                        <Text style={styles.bookBtnText}>จองคิว</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.bottomArea}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.textInput} placeholder='พิมพ์ข้อความ...' value={inputText} onChangeText={setInputText} />
            </View>
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}><Send size={20} color="#FFF" /></TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, backgroundColor: '#F7FAFC' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  chatContainer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  userMsgRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 20 },
  aiMsgRow: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 20 },
  avatarAi: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  bubble: { padding: 16, borderRadius: 20, maxWidth: '90%' },
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
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', marginRight: 12 },
  textInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: '#2D3748' },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6FA4A1', justifyContent: 'center', alignItems: 'center' },
});