import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, StatusBar, Linking, Alert } from 'react-native';
import { ArrowLeft, Share, MapPin, Clock, Sparkles, CheckCircle2, Users } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '../../hooks/useRedux';

export default function PlaceDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const allPlaces = useAppSelector((state: any) => state.places?.places || []);
  const allTickets = useAppSelector((state: any) => state.queue?.allTickets || []);
  const user = useAppSelector((state: any) => state.auth?.user) || { name: 'Taggsh' };

  const place = useMemo(() => allPlaces.find((p: any) => p.id === id), [allPlaces, id]);

  const [isOpen, setIsOpen] = useState(false);
  const [aiReason, setAiReason] = useState<string[]>([]);

  useEffect(() => {
    if (!place) return;

    // เช็คเวลาเปิดปิดร้าน
    const checkOpenStatus = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const [openHour, openMin] = (place.openTime || "10:00").split(':').map(Number);
      const [closeHour, closeMin] = (place.closeTime || "22:00").split(':').map(Number);
      
      const openTimeMinutes = openHour * 60 + openMin;
      const closeTimeMinutes = closeHour * 60 + closeMin;

      setIsOpen(currentMinutes >= openTimeMinutes && currentMinutes < closeTimeMinutes);
    };

    checkOpenStatus();

    // ลอจิก AI วิเคราะห์ประวัติ
    const generateAiReason = () => {
      const completedTickets = allTickets.filter((t: any) => t.name === user.name && t.status === 'Completed');
      const bookedShopIds = completedTickets.map((t: any) => t.shopId);
      const bookedShops = allPlaces.filter((p: any) => bookedShopIds.includes(p.id));
      
      let reasons: string[] = [];
      
      const matchedTags = place.tags?.filter((tag: string) => 
        bookedShops.some((s: any) => s.tags?.includes(tag))
      ) || [];

      if (matchedTags.length > 0) {
        reasons.push(`วิเคราะห์จากการจองร้านแนว ${matchedTags[0]} ของคุณ`);
      }
      
      if (completedTickets.length > 0) {
        reasons.push('ใกล้เคียงกับไลฟ์สไตล์การทานอาหารของคุณ');
      }

      if (reasons.length === 0) {
        reasons.push('ร้านนี้กำลังเป็นที่นิยมในขณะนี้');
        reasons.push('เหมาะกับช่วงเวลาที่คุณกำลังค้นหา');
      }

      setAiReason(reasons);
    };

    generateAiReason();
  }, [place, allTickets, user.name]);

  if (!place) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#1F2937" /></TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>ไม่พบข้อมูลร้านค้า</Text>
        </View>
      </SafeAreaView>
    );
  }

  const openGoogleMaps = () => {
    const query = (place.lat && place.lng) ? `${place.lat},${place.lng}` : encodeURIComponent(place.name);
    const mapUrl = `http://maps.google.com/maps?q=${query}`;
    
    Linking.canOpenURL(mapUrl).then((supported) => {
      if (supported) {
        Linking.openURL(mapUrl);
      } else {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเปิดแอปแผนที่ได้');
      }
    });
  };

  const handleBooking = () => {
    router.push({
      pathname: '/page/QueueBooking',
      params: { id: place.id }
    });
  };

  const estWaitTime = (place.queueCount || 5) * (place.avgServiceTime || 5);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Detail</Text>
        <TouchableOpacity style={{ padding: 4 }}>
          <Share size={20} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.coverWrapper}>
          <Image source={{ uri: place.image }} style={styles.coverImage} />
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.placeName}>{place.name}</Text>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {place.tags?.map((tag: string, index: number) => (
              <View key={index} style={styles.tagPill}>
                <Text style={styles.tagPillText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.description}>
            สัมผัสประสบการณ์ความอร่อยระดับพรีเมียมกับ {place.name} ที่คัดสรรวัตถุดิบชั้นดี สดใหม่ทุกวัน พร้อมบรรยากาศร้านที่ตอบโจทย์ทุกไลฟ์สไตล์ของคุณ
          </Text>

          <View style={styles.aiBox}>
            <View style={styles.aiBoxHeader}>
              <View style={styles.sparkleBg}><Sparkles size={14} color="#6FA4A1" /></View>
              <Text style={styles.aiBoxTitle}>Why AI recommended this</Text>
            </View>
            {aiReason.map((reason, idx) => (
              <View key={idx} style={styles.aiReasonRow}>
                <CheckCircle2 size={16} color="#6FA4A1" />
                <Text style={styles.aiReasonText}>{reason}</Text>
              </View>
            ))}
          </View>

          <View style={styles.queueBox}>
            <View style={styles.queueBoxHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Users size={18} color="#4A5568" style={{ marginRight: 6 }} />
                <Text style={styles.queueBoxTitle}>Queue Info</Text>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
            </View>

            <View style={styles.queueStatsRow}>
              <View style={styles.queueStatCard}>
                <Text style={styles.queueStatLabel}>Est. Wait</Text>
                <Text style={styles.queueStatValue}>{estWaitTime > 0 ? estWaitTime : '< 5'} min</Text>
              </View>
              <View style={styles.queueStatCard}>
                <Text style={styles.queueStatLabel}>Groups Ahead</Text>
                <Text style={styles.queueStatValue}>{place.queueCount || 5}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoList}>
            <View style={styles.infoListItem}>
              <View style={styles.infoIconBg}><MapPin size={20} color="#4A5568" /></View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoTitle}>{place.branch || 'สาขาหลัก'}</Text>
                <Text style={styles.infoSubtitle} numberOfLines={1}>{place.address || 'พิกัดร้านค้า'}</Text>
              </View>
              <TouchableOpacity onPress={openGoogleMaps}>
                <Text style={styles.mapBtnText}>Map</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.infoListItem, { borderBottomWidth: 0 }]}>
              <View style={styles.infoIconBg}><Clock size={20} color="#4A5568" /></View>
              <View style={styles.infoTextWrapper}>
                <Text style={[styles.infoTitle, { color: isOpen ? '#38A169' : '#E53E3E' }]}>
                  {isOpen ? 'Open Now' : 'Closed'}
                </Text>
                <Text style={styles.infoSubtitle}>
                  {isOpen ? `Closes at ${place.closeTime || '22:00'}` : `Opens at ${place.openTime || '10:00'}`}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>จอง / booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, backgroundColor: '#F7FAFC' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#A0AEC0' },
  scrollContent: { paddingBottom: 100 },
  coverWrapper: { alignItems: 'center', marginVertical: 10 },
  coverImage: { width: '90%', height: 200, borderRadius: 100 },
  mainContent: { paddingHorizontal: 20, paddingTop: 16 },
  placeName: { fontSize: 24, fontWeight: '800', color: '#2D3748', marginBottom: 16 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  tagPill: { backgroundColor: '#EDF2F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  tagPillText: { fontSize: 12, color: '#4A5568', fontWeight: '600' },
  description: { fontSize: 14, color: '#4A5568', lineHeight: 22, marginBottom: 24 },
  aiBox: { backgroundColor: '#F0FDF4', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#DCFCE7' },
  aiBoxHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sparkleBg: { backgroundColor: '#DCFCE7', padding: 6, borderRadius: 12, marginRight: 8 },
  aiBoxTitle: { fontSize: 15, fontWeight: '800', color: '#1F2937' },
  aiReasonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  aiReasonText: { fontSize: 13, color: '#4A5568', marginLeft: 8, flex: 1 },
  queueBox: { backgroundColor: '#EDF2F7', padding: 16, borderRadius: 16, marginBottom: 24 },
  queueBoxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  queueBoxTitle: { fontSize: 15, fontWeight: '800', color: '#2D3748' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C6F6D5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#38A169', marginRight: 4 },
  liveText: { fontSize: 10, color: '#276749', fontWeight: '800' },
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
  mapBtnText: { color: '#6FA4A1', fontWeight: '800', fontSize: 14 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 20, borderTopWidth: 1, borderTopColor: '#EDF2F7' },
  bookButton: { backgroundColor: '#6FA4A1', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  bookButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});