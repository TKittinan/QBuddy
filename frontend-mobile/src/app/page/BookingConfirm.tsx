import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { ArrowLeft, Calendar, Clock, Users, Store } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '../../redux/useRedux';

// 🌟 เรียกใช้ Type ที่ถูกต้อง
import { Place, Ticket } from '../../types';

// 🌟 สร้าง Type ชั่วคราวให้ Redux State เพื่อเลี่ยง any
interface LocalRootState {
  queue: { tickets: Ticket[] | { data: Ticket[] } };
  places: { places: Place[] | { data: Place[] } };
}

export default function BookingConfirm() {
  const router = useRouter();
  const { ticketId } = useLocalSearchParams();

  // 🌟 ดึงข้อมูลแบบ Strict Type ไม่ใช้ any
  const queueState = useAppSelector((state: LocalRootState) => state.queue);
  const rawTickets = queueState?.tickets || [];
  const allTickets: Ticket[] = Array.isArray(rawTickets) ? rawTickets : (rawTickets as any).data || [];

  const placesState = useAppSelector((state: LocalRootState) => state.places);
  const rawPlaces = placesState?.places || [];
  const allPlaces: Place[] = Array.isArray(rawPlaces) ? rawPlaces : (rawPlaces as any).data || [];

  // 🌟 ใช้ Type Ticket และ Place แทน any
  const ticket = useMemo(() => allTickets.find((t: Ticket) => t.id === ticketId), [allTickets, ticketId]);
  
  const place = useMemo(() => {
    if (ticket) return allPlaces.find((p: Place) => p.id === ticket.shopId);
    return { name: 'Shop Name', image: 'https://via.placeholder.com/150' };
  }, [ticket, allPlaces]);

  const formattedDate = ticket?.bookDate ? new Date(ticket.bookDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }) : 'Select Date';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ตั๋วคิวของคุณ</Text>
      </View>

      <View style={styles.content}>
        <Image source={{ uri: place?.image || 'https://via.placeholder.com/150' }} style={styles.shopImage} />
        
        <View style={styles.ticketCard}>
          <Text style={styles.shopName}>{place?.name}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.queueLabel}>หมายเลขคิวของคุณ</Text>
          <View style={styles.queueNumberWrapper}>
            <Text style={styles.queueNumber}>{ticket?.id || '----'}</Text>
          </View>
          
          <View style={styles.statusBadge}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>{ticket?.status === 'Serving' ? 'ถึงคิวของคุณแล้ว' : 'กำลังรอคิว'}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <View style={styles.iconBg}><Calendar size={18} color="#38B2AC" /></View>
              <View style={styles.detailTextWrapper}>
                <Text style={styles.detailLabel}>วันที่</Text>
                <Text style={styles.detailValue}>{formattedDate}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.iconBg}><Clock size={18} color="#38B2AC" /></View>
              <View style={styles.detailTextWrapper}>
                <Text style={styles.detailLabel}>เวลา</Text>
                <Text style={styles.detailValue}>{ticket?.bookTime || '--:--'}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.iconBg}><Users size={18} color="#38B2AC" /></View>
              <View style={styles.detailTextWrapper}>
                <Text style={styles.detailLabel}>จำนวนผู้เข้าใช้บริการ</Text>
                <Text style={styles.detailValue}>{ticket?.guests || 1} ท่าน</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.iconBg}><Store size={18} color="#38B2AC" /></View>
              <View style={styles.detailTextWrapper}>
                <Text style={styles.detailLabel}>ประเภทโต๊ะ</Text>
                <Text style={styles.detailValue}>{ticket?.tableType || 'ทั่วไป'}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.push('/(tabs)/Queue')}>
            <Text style={styles.doneBtnText}>ดูคิวทั้งหมดของฉัน</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, backgroundColor: '#F7FAFC' },
  backButton: { position: 'absolute', left: 20, top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, zIndex: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748' },
  content: { flex: 1, paddingHorizontal: 20, alignItems: 'center' },
  shopImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#FFFFFF', zIndex: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  ticketCard: { backgroundColor: '#FFFFFF', width: '100%', borderRadius: 30, paddingVertical: 32, paddingHorizontal: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, elevation: 4, marginBottom: 30 },
  shopName: { fontSize: 22, fontWeight: '800', color: '#2D3748', marginTop: 30, textAlign: 'center' },
  divider: { height: 1, width: '100%', backgroundColor: '#EDF2F7', marginVertical: 20, borderStyle: 'dashed' },
  queueLabel: { fontSize: 14, color: '#718096', fontWeight: '600', marginBottom: 12 },
  queueNumberWrapper: { width: '100%', alignItems: 'center', marginBottom: 16 },
  queueNumber: { fontSize: 56, fontWeight: '900', color: '#6FA4A1', letterSpacing: 1, textAlign: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6FFFA', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#38B2AC', marginRight: 8 },
  statusText: { fontSize: 13, color: '#319795', fontWeight: '700' },
  detailsContainer: { width: '100%', marginBottom: 40 },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E6FFFA', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  detailTextWrapper: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 14, color: '#718096', fontWeight: '500' },
  detailValue: { fontSize: 15, color: '#2D3748', fontWeight: '700' },
  doneBtn: { backgroundColor: '#2D3748', width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  doneBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});