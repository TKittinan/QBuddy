import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Platform, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Calendar, Clock, Users, Store } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppSelector, useAppDispatch } from '../../redux/useRedux';
import { fetchTicketsAsync } from '../../redux/slices/queueSlice';
import { Place, Ticket } from '../../types';

interface LocalRootState {
  queue: { tickets: Ticket[]; isLoading: boolean };
  places: { places: Place[] };
}

export default function BookingConfirm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { ticketId } = useLocalSearchParams();

  const queueState = useAppSelector((state: any) => state.queue);
  const isLoading = queueState.isLoading;
  const rawTickets = queueState?.tickets || [];
  const allTickets: Ticket[] = Array.isArray(rawTickets) ? rawTickets : (rawTickets as any).data || [];

  const allPlaces: Place[] = useAppSelector((state: any) => state.places.places);

  const ticket = useMemo(() => 
    allTickets.find((t: Ticket) => String(t.id).trim() === String(ticketId).trim()), 
    [allTickets, ticketId]
  );
  const place = useMemo(() => 
    allPlaces.find((p: Place) => String(p.id) === String(ticket?.placeId || ticket?.shopId)), 
    [allPlaces, ticket]
  );
  const user = useAppSelector((state: any) => state.auth?.user);
  const identifier = user?.email || user?.name;

  useEffect(() => {
    if (!ticket && identifier) {
      dispatch(fetchTicketsAsync(identifier));
    }
  }, [ticket, dispatch, identifier]);
  
  const formatThaiDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (isLoading && !ticket) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6FA4A1" />
          <Text style={{ marginTop: 10, color: '#718096' }}>กำลังตรวจสอบคิวของคุณ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ticket || !place) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/Home')}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={{ color: '#718096', textAlign: 'center' }}>ไม่พบข้อมูลการจอง ID: {ticketId}</Text>
          <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.replace('/(tabs)/Home')}>
            <Text style={{ color: '#6FA4A1', fontWeight: 'bold' }}>กลับหน้าหลัก</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/Home')} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>รายละเอียดคิว</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.successCard}>
          <View style={styles.successIconBg}>
            <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/5610/5610944.png' }} style={styles.successIcon} />
          </View>
          <Text style={styles.successTitle}>จองคิวสำเร็จ!</Text>
          <Text style={styles.successSubtitle}>กรุณาแสดงหน้านี้ให้พนักงานเมื่อถึงร้าน</Text>

          <View style={styles.divider} />

          <Text style={styles.queueLabel}>Booking ID ของคุณ</Text>
          <View style={styles.queueNumberWrapper}>
            <Text style={styles.queueNumber} numberOfLines={1} adjustsFontSizeToFit>
              {ticket.id}
            </Text>
          </View>
          
          <View style={styles.statusBadge}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>
              {ticket.status === 'Waiting' ? 'กำลังรอคิว' : 'ยืนยันการจองแล้ว'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>ข้อมูลการจอง</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <View style={styles.iconBg}><Store size={20} color="#6FA4A1" /></View>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>ร้าน</Text>
              <Text style={styles.detailValue}>{place.name} ({place.branch || 'สาขาหลัก'})</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.iconBg}><Calendar size={20} color="#6FA4A1" /></View>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>วันที่</Text>
              <Text style={styles.detailValue}>{formatThaiDate(ticket.bookDate)}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.iconBg}><Clock size={20} color="#6FA4A1" /></View>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>เวลา</Text>
              <Text style={styles.detailValue}>{ticket.bookTime} น.</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.iconBg}><Users size={20} color="#6FA4A1" /></View>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>จำนวน</Text>
              <Text style={styles.detailValue}>{ticket.guests} ท่าน ({ticket.tableType || 'โต๊ะมาตรฐาน'})</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)/Home')}>
          <Text style={styles.homeBtnText}>กลับหน้าหลัก</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  successCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#EDF2F7' },
  successIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E6FFFA', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  successIcon: { width: 40, height: 40, tintColor: '#38B2AC' },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#2D3748', marginBottom: 8 },
  successSubtitle: { fontSize: 14, color: '#718096', textAlign: 'center', paddingHorizontal: 20 },
  divider: { height: 1, width: '100%', backgroundColor: '#EDF2F7', marginVertical: 20, borderStyle: 'dashed' },
  queueLabel: { fontSize: 14, color: '#718096', fontWeight: '600', marginBottom: 12 },
  queueNumberWrapper: { width: '100%', alignItems: 'center', marginBottom: 16 },
  queueNumber: { fontSize: 24, fontWeight: '900', color: '#6FA4A1', letterSpacing: 0.5, textAlign: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6FFFA', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#38B2AC', marginRight: 8 },
  statusText: { fontSize: 13, color: '#319795', fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginBottom: 16, marginLeft: 4 },
  detailsContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#EDF2F7' },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F7FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#EDF2F7' },
  detailTextWrapper: { flex: 1 },
  detailLabel: { fontSize: 13, color: '#718096', marginBottom: 2 },
  detailValue: { fontSize: 15, fontWeight: '700', color: '#2D3748' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 20, borderTopWidth: 1, borderTopColor: '#EDF2F7' },
  homeBtn: { backgroundColor: '#344054', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  homeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});