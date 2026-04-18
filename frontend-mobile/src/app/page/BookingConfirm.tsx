import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { ArrowLeft, Calendar, Clock, Users, Store } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '../../redux/useRedux';

export default function BookingConfirm() {
  const router = useRouter();
  const { ticketId } = useLocalSearchParams();

  // 🌟 เปลี่ยน allTickets เป็น tickets
  const allTickets = useAppSelector((state: any) => state.queue?.tickets || []);
  const allPlaces = useAppSelector((state: any) => state.places?.places || []);

  const ticket = useMemo(() => allTickets.find((t: any) => t.id === ticketId), [allTickets, ticketId]);
  
  const place = useMemo(() => {
    if (ticket) return allPlaces.find((p: any) => p.id === ticket.shopId);
    return { name: 'Shop Name', image: 'https://via.placeholder.com/150' };
  }, [ticket, allPlaces]);

  const formattedDate = ticket?.bookDate ? new Date(ticket.bookDate).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }) : 'Select Date';

  // [SUPABASE DB CONNECTION MOCKUP]
  /*
    const fetchTicketData = async () => {
      const { data } = await supabase.from('tickets').select('*, places(*)').eq('id', ticketId).single();
    }
  */

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Confirmation</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.shopImageContainer}>
          <Image source={{ uri: place?.image }} style={styles.shopImage} />
        </View>

        <Text style={styles.statusLabel}>Booking Confirmed</Text>
        <Text style={styles.shopName}>{place?.name}</Text>

        <View style={styles.queueCard}>
          <Text style={styles.queueLabel}>Queue Number</Text>
          <View style={styles.queueNumberWrapper}>
            <Text 
              style={styles.queueNumber} 
              adjustsFontSizeToFit 
              numberOfLines={1}
            >
              {ticket?.id || 'A-000'}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>รอเรียกคิว</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <View style={styles.iconBg}><Calendar size={18} color="#6FA4A1" /></View>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formattedDate}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.iconBg}><Clock size={18} color="#6FA4A1" /></View>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{ticket?.bookTime || '00:00'}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.iconBg}><Users size={18} color="#6FA4A1" /></View>
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>Guests</Text>
              <Text style={styles.detailValue}>{ticket?.guests || 1} ท่าน</Text>
            </View>
          </View>

          {ticket?.tableType && (
            <View style={styles.detailItem}>
              <View style={styles.iconBg}><Store size={18} color="#6FA4A1" /></View>
              <View style={styles.detailTextWrapper}>
                <Text style={styles.detailLabel}>Table</Text>
                <Text style={styles.detailValue}>{ticket.tableType}</Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)/Home')}>
          <Text style={styles.homeBtnText}>Home / กลับหน้าหลัก</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  content: { flex: 1, paddingHorizontal: 30, alignItems: 'center', paddingTop: 20 },
  shopImageContainer: { width: 140, height: 140, borderRadius: 70, overflow: 'hidden', borderWidth: 4, borderColor: '#FFFFFF', elevation: 5, marginBottom: 20 },
  shopImage: { width: '100%', height: '100%' },
  statusLabel: { fontSize: 14, color: '#A0AEC0', fontWeight: '600', marginBottom: 8 },
  shopName: { fontSize: 22, fontWeight: '800', color: '#2D3748', textAlign: 'center', marginBottom: 30 },
  queueCard: { backgroundColor: '#FFFFFF', width: '100%', borderRadius: 24, paddingVertical: 32, paddingHorizontal: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, elevation: 4, marginBottom: 30 },
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
  detailValue: { fontSize: 14, color: '#2D3748', fontWeight: '800' },
  homeBtn: { width: '100%', backgroundColor: '#6FA4A1', paddingVertical: 18, borderRadius: 20, alignItems: 'center', position: 'absolute', bottom: 30 },
  homeBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});