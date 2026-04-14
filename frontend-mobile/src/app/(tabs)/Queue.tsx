import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, Platform, StatusBar } from 'react-native';
import { MapPin, Ticket as TicketIcon, Calendar as CalendarIcon, Clock, Users, Store, AlertCircle } from 'lucide-react-native';

// 🌟 นำเข้าจาก Redux (เอาไว้ใช้ตอนเชื่อมจริง)
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { updateQueueStatus } from '../../redux/slices/queueSlice'; 

type FilterType = 'active' | 'all' | 'success' | 'cancelled';

// ==========================================================
// 🧪 MOCK DATA ZONE (สำหรับดูรูปแบบการแสดงผล)
// ==========================================================
const MOCK_USER = { name: "Taggsh" };

const MOCK_PLACES_DB = [
  { id: 'shop_apple_thon', name: 'Apple (Thonglor)', branch: 'Thonglor', placeId: '#AT-RC-003', logoUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500', categories: ['ร้านอาหาร', 'คาเฟ่'], address: '123 Sukhumvit Road, Bangkok', avgServiceTime: 15 },
  { id: 'shop_shabushi', name: 'Shabushi (Central World)', branch: 'Central World', placeId: '#SBN-R-001', logoUrl: 'https://images.unsplash.com/photo-1526462153549-36224314cfa8?w=500', categories: ['ร้านอาหาร'], address: '6th Floor, Central World', avgServiceTime: 10 },
  { id: 'shop_cafe_vibe', name: 'Vibe Cafe (Siam)', branch: 'Siam Square', placeId: '#VC-C-002', logoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500', categories: ['คาเฟ่'], address: 'Siam Square One', avgServiceTime: 5 }
];

const MOCK_TICKETS = [
  // คิวที่ 1: กำลังรอ (Waiting) - แสดง ID รูปแบบใหม่
  { id: 'ATRC3-CTM1', name: 'Taggsh', service: 'ร้านอาหาร', shopId: 'shop_apple_thon', status: 'Waiting', createdAt: new Date().toISOString() },
  // คิวที่ 2: กำลังเรียก (Serving)
  { id: 'SBNR1-CTM5', name: 'Taggsh', service: 'ร้านอาหาร', shopId: 'shop_shabushi', status: 'Serving', createdAt: new Date().toISOString() },
  // คิวที่ 3: สำเร็จแล้ว (Completed)
  { id: 'VCC2-CTM10', name: 'Taggsh', service: 'คาเฟ่', shopId: 'shop_cafe_vibe', status: 'Completed', createdAt: new Date(Date.now() - 86400000).toISOString() }, // Yesterday
  // คิวที่ 4: ยกเลิกแล้ว (Cancelled)
  { id: 'ATRC3-CTM0', name: 'Taggsh', service: 'คาเฟ่', shopId: 'shop_apple_thon', status: 'Cancelled', createdAt: new Date(Date.now() - 172800000).toISOString() } // 2 days ago
];
// ==========================================================

export default function QueuePage() {
  const dispatch = useAppDispatch();
  
  // 🌟 สำหรับตอนนี้เราใช้ Mock Data แทนการดึงจาก Redux เพื่อดูรูปแบบ
  const user = MOCK_USER; 
  const allTickets = MOCK_TICKETS;
  const places = MOCK_PLACES_DB;

  const [activeFilter, setActiveFilter] = useState<FilterType>('active');

  // กรองเฉพาะคิวที่เป็นของ User คนนี้
  const myTickets = useMemo(() => {
    if (!user) return [];
    return allTickets.filter((t: any) => t.name === user.name);
  }, [allTickets, user]);

  const activeTickets = myTickets.filter((t: any) => t.status === 'Waiting' || t.status === 'Serving');
  const historyTickets = myTickets.filter((t: any) => t.status === 'Completed' || t.status === 'Cancelled' || t.status === 'Skipped');

  const getQueueDetails = (ticket: any) => {
    const shop: any = places.find((p: any) => p.id === ticket.shopId) || { name: 'Unknown', address: 'Unknown', avgServiceTime: 15 };
    const queuesAhead = ticket.status === 'Serving' ? 0 : 2; // จำลองว่ารออีก 2 คิว
    const estimatedWaitTime = queuesAhead * (shop.avgServiceTime || 15);
    return { shop, queuesAhead, estimatedWaitTime };
  };

  const handleCancelQueue = (ticketId: string) => {
    Alert.alert('ยกเลิกการจอง', 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคิวนี้?', [
      { text: 'ปิด', style: 'cancel' },
      { text: 'ยืนยันการยกเลิก', style: 'destructive', onPress: () => Alert.alert('สำเร็จ', 'ยกเลิกคิวเรียบร้อยแล้ว') }
    ]);
  };

  const filteredHistory = historyTickets.filter((item: any) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'success' && item.status === 'Completed') return true;
    if (activeFilter === 'cancelled' && (item.status === 'Cancelled' || item.status === 'Skipped')) return true;
    return false;
  });

  const groupedHistory = filteredHistory.reduce((acc: any, ticket: any) => {
    const date = new Date(ticket.createdAt);
    const dateLabel = date.toDateString() === new Date().toDateString() ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!acc[dateLabel]) acc[dateLabel] = [];
    acc[dateLabel].push(ticket);
    return acc;
  }, {});

  const FilterButton = ({ label, type }: { label: string, type: FilterType }) => {
    const isActive = activeFilter === type;
    return (
      <TouchableOpacity style={[styles.filterBtn, isActive && styles.filterBtnActive]} onPress={() => setActiveFilter(type)}>
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}><Text style={styles.headerTitle}>คิวของฉัน</Text></View>

      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          <FilterButton label="ทั้งหมด" type="all" />
          <FilterButton label="คิวที่จอง" type="active" />
          <FilterButton label="สำเร็จ" type="success" />
          <FilterButton label="ยกเลิก" type="cancelled" />
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeFilter === 'active' ? (
          activeTickets.length > 0 ? (
            <View>
              {activeTickets.map((ticket: any) => {
                const { shop, queuesAhead, estimatedWaitTime } = getQueueDetails(ticket);
                return (
                  <View key={ticket.id} style={styles.mainCard}>
                    <View style={styles.shopSection}>
                      <Image source={{ uri: shop.logoUrl }} style={styles.shopImg} />
                      <View style={styles.shopText}>
                        <Text style={styles.shopName} numberOfLines={1}>{shop.name.split(' (')[0]}</Text>
                        <View style={styles.locationTag}><Store size={12} color="#718096" /><Text style={styles.locationTextSmall}>{shop.branch}</Text></View>
                      </View>
                    </View>

                    <View style={styles.queueDisplay}>
                      <Text style={styles.queueLabel}>หมายเลขคิวของคุณคือ</Text>
                      {/* 🌟 แสดง Ticket ID แบบใหม่: ATRC3-CTM1 */}
                      <Text style={styles.queueNumberDisplay}>{ticket.id}</Text>
                      <View style={[styles.statusBadgeActive, ticket.status === 'Serving' && { backgroundColor: '#EBF8FF', borderColor: '#BEE3F8' }]}>
                        <Text style={[styles.statusTextActive, ticket.status === 'Serving' && { color: '#3182CE' }]}>
                          {ticket.status === 'Serving' ? '📢 กำลังเรียกคิวของคุณ' : `รออีก ${queuesAhead} คิว`}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <View style={styles.infoItem}>
                        <View style={styles.iconCircleBlue}><Users size={20} color="#3182CE" /></View>
                        <Text style={styles.infoLabel}>คิวที่รออยู่</Text>
                        <Text style={styles.infoValue}>{queuesAhead} คิว</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <View style={styles.iconCircleOrange}><Clock size={20} color="#DD6B20" /></View>
                        <Text style={styles.infoLabel}>รอประมาณ</Text>
                        <Text style={styles.infoValue}>~{estimatedWaitTime} นาที</Text>
                      </View>
                    </View>

                    <View style={[styles.warningCard, { marginTop: 24 }]}>
                      <AlertCircle size={20} color="#E53E3E" />
                      <Text style={styles.warningText}>กรุณามาถึงร้านก่อนถึงคิวของคุณประมาณ 10 นาที</Text>
                    </View>

                    <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}><Text style={styles.menuButtonText}>ดูเมนูอาหาร</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelQueue(ticket.id)} activeOpacity={0.7}><Text style={styles.cancelButtonText}>ยกเลิกการจอง</Text></TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : <EmptyQueue />
        ) : (
          Object.keys(groupedHistory).length === 0 ? <EmptyQueue /> : (
            Object.keys(groupedHistory).map((dateKey) => (
              <View key={dateKey}>
                <Text style={styles.dateLabel}>{dateKey}</Text>
                {groupedHistory[dateKey].map((booking: any) => {
                  const shop: any = places.find((p: any) => p.id === booking.shopId) || { name: 'Unknown' };
                  const isSuccess = booking.status === 'Completed';
                  return (
                    <View key={booking.id} style={[styles.card, isSuccess ? styles.cardSuccess : styles.cardCancelled]}>
                      <View style={styles.cardMain}>
                        <Image source={{ uri: shop.logoUrl }} style={styles.shopImageHistory} />
                        <View style={styles.shopDetails}>
                          <View style={styles.shopTitleRow}>
                            <Text style={styles.shopNameHistory} numberOfLines={1}>{shop.name.split(' (')[0]}</Text>
                            <View style={[styles.statusBadge, isSuccess ? styles.badgeSuccess : styles.badgeCancelled]}>
                              <Text style={[styles.statusBadgeText, isSuccess ? styles.badgeTextSuccess : styles.badgeTextCancelled]}>{isSuccess ? 'สำเร็จ' : 'ยกเลิก'}</Text>
                            </View>
                          </View>
                          <Text style={styles.shopCategory}>{booking.service}</Text>
                          <View style={styles.queueTimeRow}>
                            <View style={styles.queueTag}><TicketIcon size={12} color="#4A5568" /><Text style={styles.queueText}>{booking.id}</Text></View>
                            <Text style={styles.timeText}>{new Date(booking.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const EmptyQueue = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconCircle}><CalendarIcon size={32} color="#A0AEC0" /></View>
    <Text style={styles.emptyTitle}>ไม่มีรายการจอง</Text>
    <Text style={styles.emptySubtitle}>คุณยังไม่ได้ทำการจองคิวร้านใดๆ ในขณะนี้</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EEF2F4' },
  header: { alignItems: 'center', justifyContent: 'center', paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748' },
  filterWrapper: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#FFFFFF', marginRight: 8, borderWidth: 1, borderColor: '#EDF2F7' },
  filterBtnActive: { backgroundColor: '#2D3748', borderColor: '#2D3748' },
  filterText: { fontSize: 13, fontWeight: '700', color: '#4A5568' },
  filterTextActive: { color: '#FFFFFF' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  mainCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 6, marginBottom: 20 },
  shopSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  shopImg: { width: 50, height: 50, borderRadius: 12 },
  shopText: { marginLeft: 14, flex: 1 },
  shopName: { fontSize: 18, fontWeight: '700', color: '#2D3748' },
  locationTag: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationTextSmall: { fontSize: 12, color: '#718096', marginLeft: 4 },
  queueDisplay: { alignItems: 'center', marginVertical: 10 },
  queueLabel: { fontSize: 14, color: '#A0AEC0', fontWeight: '600', marginBottom: 8 },
  queueNumberDisplay: { fontSize: 36, fontWeight: '900', color: '#6FA4A1', letterSpacing: 1 },
  statusBadgeActive: { backgroundColor: '#F0FDF4', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 10, borderWidth: 1, borderColor: '#DCFCE7' },
  statusTextActive: { color: '#166534', fontSize: 14, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#EDF2F7', marginVertical: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-around' },
  infoItem: { alignItems: 'center' },
  iconCircleBlue: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EBF8FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  iconCircleOrange: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 12, color: '#718096', fontWeight: '500' },
  infoValue: { fontSize: 16, fontWeight: '800', color: '#2D3748', marginTop: 2 },
  warningCard: { flexDirection: 'row', backgroundColor: '#FFF5F5', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FED7D7', marginBottom: 24 },
  warningText: { flex: 1, marginLeft: 12, fontSize: 13, color: '#C53030', lineHeight: 18 },
  menuButton: { backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#6FA4A1', marginBottom: 12 },
  menuButtonText: { color: '#6FA4A1', fontSize: 16, fontWeight: '700' },
  cancelButton: { backgroundColor: '#FFF5F5', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FED7D7' },
  cancelButtonText: { color: '#E53E3E', fontSize: 16, fontWeight: '700' },
  dateLabel: { fontSize: 12, fontWeight: '700', color: '#718096', marginBottom: 12, marginTop: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderRightWidth: 3 },
  cardSuccess: { borderRightColor: '#6FA4A1' },
  cardCancelled: { borderRightColor: '#E53E3E' },
  cardMain: { flexDirection: 'row', alignItems: 'center' },
  shopImageHistory: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EDF2F7' },
  shopDetails: { flex: 1, marginLeft: 16 },
  shopTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shopNameHistory: { fontSize: 15, fontWeight: '800', color: '#2D3748', flex: 1, marginRight: 8 },
  shopCategory: { fontSize: 12, color: '#718096', marginTop: 2, marginBottom: 6 },
  queueTimeRow: { flexDirection: 'row', alignItems: 'center' },
  queueTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF2F7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 8 },
  queueText: { fontSize: 11, fontWeight: '800', color: '#2D3748', marginLeft: 4 },
  timeText: { fontSize: 12, color: '#A0AEC0', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeSuccess: { backgroundColor: '#E6FFFA' },
  badgeTextSuccess: { color: '#38A169' },
  badgeCancelled: { backgroundColor: '#FFF5F5' },
  badgeTextCancelled: { color: '#E53E3E' },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  emptyContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 40, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F7FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#718096', textAlign: 'center', marginBottom: 24 },
});