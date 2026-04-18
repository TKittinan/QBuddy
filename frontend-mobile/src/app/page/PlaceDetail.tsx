import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, StatusBar, Linking, Alert } from 'react-native';
import { ArrowLeft, Share, MapPin, Clock, Sparkles, CheckCircle2, Users } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useAppSelector } from '../../redux/useRedux';
import { Place, Ticket } from '../../types';

export default function PlaceDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // 🌟 บังคับ Type จาก Redux ทันที ไม่ต้องดัก any
  const allPlaces: Place[] = useAppSelector((state: any) => state.places.places);
  const allTickets: Ticket[] = useAppSelector((state: any) => state.queue.tickets);
  
  const place = useMemo(() => allPlaces.find((p: Place) => p.id === id), [allPlaces, id]);

  const [isOpen, setIsOpen] = useState(false);
  const [aiReason, setAiReason] = useState<string[]>([]);

  useEffect(() => {
    if (!place) return;

    const checkOpenStatus = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const [openHour, openMin] = (place.openTime || "10:00").split(':').map(Number);
      const [closeHour, closeMin] = (place.closeTime || "22:00").split(':').map(Number);
      
      const openMinutes = openHour * 60 + openMin;
      const closeMinutes = closeHour * 60 + closeMin;

      if (closeMinutes < openMinutes) {
        setIsOpen(currentMinutes >= openMinutes || currentMinutes <= closeMinutes);
      } else {
        setIsOpen(currentMinutes >= openMinutes && currentMinutes <= closeMinutes);
      }
    };
    
    checkOpenStatus();
    const timer = setInterval(checkOpenStatus, 60000);

    const reasons = [
      "คุณเคยไปร้านประเภทนี้บ่อยๆ",
      "มีโต๊ะว่างในช่วงเวลาที่คุณมักจะจอง",
      "ร้านนี้ได้รับความนิยมสูงในบริเวณนี้"
    ];
    setAiReason(reasons.slice(0, Math.floor(Math.random() * 2) + 1));

    return () => clearInterval(timer);
  }, [place]);

  const activeQueuesCount = useMemo(() => {
    return allTickets.filter((t: Ticket) => t.shopId === id && (t.status === 'Waiting' || t.status === 'Serving')).length;
  }, [allTickets, id]);

  const estimatedWaitTime = useMemo(() => {
    return activeQueuesCount * (place?.avgServiceTime || 15);
  }, [activeQueuesCount, place]);

  const handleShare = async () => {
    Alert.alert('แชร์ร้าน', 'คัดลอกลิงก์เรียบร้อยแล้ว');
  };

  const handleOpenMap = () => {
    if (place?.lat && place?.lng) {
      const url = Platform.select({
        ios: `maps:${place.lat},${place.lng}?q=${place.name}`,
        android: `geo:${place.lat},${place.lng}?q=${place.lat},${place.lng}(${place.name})`
      });
      if (url) Linking.openURL(url);
    } else {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบพิกัดของร้านนี้');
    }
  };

  const handleCall = () => {
    if (place?.phone) {
      Linking.openURL(`tel:${place.phone}`);
    } else {
      Alert.alert('ข้อผิดพลาด', 'ไม่มีเบอร์ติดต่อของร้านนี้');
    }
  };

  if (!place) return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#1F2937" /></TouchableOpacity></View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>ไม่พบข้อมูลร้าน</Text></View>
    </SafeAreaView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F7FAFC' }}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        <View style={styles.imageHeaderContainer}>
          <Image source={{ uri: place.coverUrl || place.image }} style={styles.coverImage} />
          <View style={styles.imageOverlay}>
            <SafeAreaView>
              <View style={styles.topNav}>
                <TouchableOpacity onPress={() => router.back()} style={styles.navButton}><ArrowLeft size={22} color="#2D3748" /></TouchableOpacity>
                <TouchableOpacity onPress={handleShare} style={styles.navButton}><Share size={20} color="#2D3748" /></TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </View>

        <View style={styles.contentContainer}>
          
          <View style={styles.shopInfoCard}>
            <View style={styles.shopHeaderRow}>
              <Image source={{ uri: place.logoUrl || place.image }} style={styles.shopLogo} />
              <View style={styles.shopTitleBox}>
                <Text style={styles.shopName}>{place.name}</Text>
                <View style={styles.tagsRow}>
                  {place.category && (
                    <View style={styles.tagBadge}><Text style={styles.tagText}>{place.category}</Text></View>
                  )}
                </View>
              </View>
            </View>

            <Text style={styles.descriptionText}>{place.description || 'ไม่มีรายละเอียดร้าน'}</Text>
          </View>

          {place.isRecommended && (
            <View style={styles.aiRecommendBox}>
              <View style={styles.aiHeader}><Sparkles size={18} color="#D69E2E" /><Text style={styles.aiTitle}>AI แนะนำร้านนี้ให้คุณ</Text></View>
              {aiReason.map((reason, idx) => (
                <View key={idx} style={styles.aiReasonRow}><CheckCircle2 size={14} color="#6FA4A1" /><Text style={styles.aiReasonText}>{reason}</Text></View>
              ))}
            </View>
          )}

          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>สถานะคิวปัจจุบัน</Text></View>
          <View style={styles.queueStatusContainer}>
            <View style={styles.statusIndicatorRow}>
              <View style={styles.pulseDotWrapper}>
                <View style={[styles.pulseDot, { backgroundColor: isOpen ? '#48BB78' : '#E53E3E' }]} />
              </View>
              <Text style={[styles.statusText, { color: isOpen ? '#276749' : '#9B2C2C' }]}>
                {isOpen ? 'กำลังเปิดรับคิว' : 'ปิดรับคิวแล้ว'}
              </Text>
            </View>
            <View style={styles.queueStatsRow}>
              <View style={styles.queueStatCard}>
                <Text style={styles.queueStatLabel}>คิวที่รออยู่</Text>
                <Text style={styles.queueStatValue}>{activeQueuesCount}</Text>
              </View>
              <View style={styles.queueStatCard}>
                <Text style={styles.queueStatLabel}>รอประมาณ</Text>
                <Text style={styles.queueStatValue}>{estimatedWaitTime} นาที</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>รายละเอียดร้าน</Text></View>
          <View style={styles.infoList}>
            <View style={styles.infoListItem}>
              <View style={styles.infoIconBg}><MapPin size={20} color="#6FA4A1" /></View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoTitle}>ที่ตั้งสาขา</Text>
                <Text style={styles.infoSubtitle}>{place.branch} ({place.distance ? `${place.distance} กม.` : 'ไม่ทราบระยะทาง'})</Text>
              </View>
              <TouchableOpacity style={styles.actionBtnOutline} onPress={handleOpenMap}><Text style={styles.actionBtnTextOutline}>แผนที่</Text></TouchableOpacity>
            </View>

            <View style={styles.infoListItem}>
              <View style={styles.infoIconBg}><Clock size={20} color="#6FA4A1" /></View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoTitle}>เวลาทำการ</Text>
                <Text style={styles.infoSubtitle}>{place.openTime} - {place.closeTime}</Text>
              </View>
            </View>

            {place.phone && (
              <View style={[styles.infoListItem, { borderBottomWidth: 0 }]}>
                <View style={styles.infoIconBg}><Users size={20} color="#6FA4A1" /></View>
                <View style={styles.infoTextWrapper}>
                  <Text style={styles.infoTitle}>ติดต่อร้าน</Text>
                  <Text style={styles.infoSubtitle}>{place.phone}</Text>
                </View>
                <TouchableOpacity style={styles.actionBtnOutline} onPress={handleCall}><Text style={styles.actionBtnTextOutline}>โทร</Text></TouchableOpacity>
              </View>
            )}
          </View>
          
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.bookingBtn, !isOpen && styles.bookingBtnDisabled]} 
          disabled={!isOpen}
          onPress={() => router.push({ pathname: '/page/QueueBooking', params: { id: place.id } })}
        >
          <Text style={styles.bookingBtnText}>{isOpen ? 'จองคิวเลย' : 'ร้านปิดให้บริการ'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, backgroundColor: '#FFFFFF' },
  imageHeaderContainer: { height: 280, position: 'relative' },
  coverImage: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 20 : 10 },
  navButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
  contentContainer: { flex: 1, backgroundColor: '#F7FAFC', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 100 },
  shopInfoCard: { marginBottom: 24 },
  shopHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  shopLogo: { width: 70, height: 70, borderRadius: 16, borderWidth: 3, borderColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  shopTitleBox: { flex: 1, marginLeft: 16 },
  shopName: { fontSize: 24, fontWeight: '900', color: '#2D3748', marginBottom: 6 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tagBadge: { backgroundColor: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 6, marginBottom: 4 },
  tagText: { fontSize: 11, color: '#4A5568', fontWeight: '600' },
  descriptionText: { fontSize: 14, color: '#718096', lineHeight: 22 },
  aiRecommendBox: { backgroundColor: '#FFFAF0', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FEEBC8', marginBottom: 24 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  aiTitle: { fontSize: 14, fontWeight: '800', color: '#B7791F', marginLeft: 6 },
  aiReasonRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  aiReasonText: { fontSize: 13, color: '#744210', marginLeft: 8 },
  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748' },
  queueStatusContainer: { backgroundColor: '#E6FFFA', borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#B2F5EA' },
  statusIndicatorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, backgroundColor: '#FFFFFF', paddingVertical: 8, borderRadius: 12 },
  pulseDotWrapper: { justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  pulseDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 14, fontWeight: '800' },
  queueStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  queueStatCard: { backgroundColor: '#FFFFFF', flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginHorizontal: 4 },
  queueStatLabel: { fontSize: 12, color: '#718096', marginBottom: 4 },
  queueStatValue: { fontSize: 20, fontWeight: '900', color: '#2D3748' },
  infoList: { marginBottom: 30 },
  infoListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  infoIconBg: { backgroundColor: '#EDF2F7', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  infoTextWrapper: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '800', color: '#2D3748', marginBottom: 2 },
  infoSubtitle: { fontSize: 13, color: '#718096' },
  actionBtnOutline: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#6FA4A1' },
  actionBtnTextOutline: { color: '#6FA4A1', fontSize: 12, fontWeight: '700' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 30 : 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#EDF2F7', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  bookingBtn: { backgroundColor: '#6FA4A1', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  bookingBtnDisabled: { backgroundColor: '#CBD5E0' },
  bookingBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});