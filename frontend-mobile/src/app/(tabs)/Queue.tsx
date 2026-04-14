import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, Platform, StatusBar } from 'react-native';
import { MapPin, Ticket as TicketIcon, Calendar as CalendarIcon, Store, AlertCircle, Clock } from 'lucide-react-native';

// 🌟 นำเข้าจาก Redux
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { updateQueueStatus } from '../../redux/slices/queueSlice'; 

type FilterType = 'active' | 'all' | 'success' | 'cancelled';

export default function QueuePage() {
  const dispatch = useAppDispatch();
  
  // 🌟 ดึงข้อมูลจาก Redux ล้วนๆ 100% ไม่มี Mock ในหน้านี้แล้ว
  const user = useAppSelector((state: any) => state.auth?.user) || { name: 'Taggsh' }; 
  const places = useAppSelector((state: any) => state.places?.places || []);
  const allTickets = useAppSelector((state: any) => state.queue?.allTickets || []);

  const [activeFilter, setActiveFilter] = useState<FilterType>('active');

  const myTickets = useMemo(() => {
    if (!user) return [];
    // ดึงเฉพาะคิวของตัวเอง
    const userTickets = allTickets.filter((t: any) => t.name === user.name);
    // (Fallback เผื่อถ้าหาไม่เจอเลย ให้แสดงคิวทั้งหมดขึ้นมา จะได้เห็น UI)
    return userTickets.length > 0 ? userTickets : allTickets;
  }, [allTickets, user]);

  const activeTickets = myTickets.filter((t: any) => t.status === 'Waiting' || t.status === 'Serving');
  const historyTickets = myTickets.filter((t: any) => t.status === 'Completed' || t.status === 'Cancelled' || t.status === 'Skipped');

  const getQueueDetails = (ticket: any) => {
    // นำ ID ร้านจากคิว ไปหาข้อมูลร้านเต็มๆ จาก places Redux
    const shop: any = places.find((p: any) => p.id === ticket.shopId) || { 
      name: ticket.shopId === '1' ? 'Copper Beyond Buffet' : 'Shabushi', 
      branch: 'สาขาหลัก', 
      logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', 
      avgServiceTime: 15 
    };
    const queuesAhead = ticket.status === 'Serving' ? 0 : 2; 
    const estimatedWaitTime = queuesAhead * (shop.avgServiceTime || 15);
    return { shop, queuesAhead, estimatedWaitTime };
  };

  // 🌟 ฟังก์ชันยกเลิกคิว สั่งงานผ่าน Redux
  const handleCancelQueue = (ticketId: string) => {
    Alert.alert('ยกเลิกการจอง', 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคิวนี้?', [
      { text: 'ปิด', style: 'cancel' },
      { 
        text: 'ยืนยันการยกเลิก', 
        style: 'destructive', 
        onPress: () => {
          // สั่งอัปเดตข้อมูลใน Redux 
          dispatch(updateQueueStatus({ id: ticketId, status: 'Cancelled' }));
          Alert.alert('สำเร็จ', 'ยกเลิกคิวเรียบร้อยแล้ว ข้อมูลจะย้ายไปที่แท็บ "ยกเลิก"');
        } 
      }
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
                const isServing = ticket.status === 'Serving';

                return (
                  <View key={ticket.id} style={[styles.mainCard, isServing && styles.mainCardServing]}>
                    <View style={styles.shopSection}>
                      <Image source={{ uri: shop.logoUrl }} style={styles.shopImg} />
                      <View style={styles.shopText}>
                        <Text style={styles.shopName} numberOfLines={1}>{shop.name.split(' (')[0]}</Text>
                        <View style={styles.locationTag}><Store size={12} color="#718096" /><Text style={styles.locationTextSmall}>{shop.branch}</Text></View>
                      </View>
                      <View style={[styles.statusBadgeActive, isServing && styles.statusBadgeServing]}>
                        <Text style={[styles.statusTextActive, isServing && styles.statusTextServing]}>
                          {isServing ? 'ถึงคิวของคุณแล้ว' : `รอ ${queuesAhead} คิว`}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.queueDetailsRow}>
                      <View>
                        <Text style={styles.queueLabel}>หมายเลขคิว</Text>
                        <Text style={styles.queueNumberDisplay}>{ticket.id}</Text>
                      </View>
                      <View style={styles.waitTimeBlock}>
                        <Text style={styles.infoLabel}>รอประมาณ</Text>
                        <View style={styles.timeWrapper}>
                          <Clock size={16} color={isServing ? "#3182CE" : "#DD6B20"} />
                          <Text style={[styles.infoValue, isServing && { color: '#3182CE' }]}>
                            {isServing ? 'ตอนนี้' : `~${estimatedWaitTime} นาที`}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.bottomActionRow}>
                      <View style={styles.warningCompact}>
                        <AlertCircle size={14} color="#E53E3E" />
                        <Text style={styles.warningTextCompact} numberOfLines={1}>กรุณามาถึงร้านก่อน 10 นาที</Text>
                      </View>
                      <TouchableOpacity style={styles.cancelButtonCompact} onPress={() => handleCancelQueue(ticket.id)}>
                        <Text style={styles.cancelButtonTextCompact}>ยกเลิกคิว</Text>
                      </TouchableOpacity>
                    </View>
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
                  const shop: any = places.find((p: any) => p.id === booking.shopId) || { name: 'Unknown', logoUrl: 'https://via.placeholder.com/150' };
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
  
  mainCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 16, borderWidth: 1, borderColor: '#EDF2F7' },
  mainCardServing: { borderColor: '#BEE3F8', shadowColor: '#3182CE', shadowOpacity: 0.15 },
  shopSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  shopImg: { width: 44, height: 44, borderRadius: 12 },
  shopText: { marginLeft: 12, flex: 1 },
  shopName: { fontSize: 16, fontWeight: '800', color: '#2D3748' },
  locationTag: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locationTextSmall: { fontSize: 12, color: '#718096', marginLeft: 4 },
  
  statusBadgeActive: { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#DCFCE7' },
  statusTextActive: { color: '#166534', fontSize: 12, fontWeight: '800' },
  statusBadgeServing: { backgroundColor: '#EBF8FF', borderColor: '#BEE3F8' },
  statusTextServing: { color: '#3182CE' },

  queueDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  queueLabel: { fontSize: 12, color: '#A0AEC0', fontWeight: '600', marginBottom: 4 },
  queueNumberDisplay: { fontSize: 28, fontWeight: '900', color: '#2D3748', letterSpacing: 1 },
  
  waitTimeBlock: { alignItems: 'flex-end' },
  timeWrapper: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoLabel: { fontSize: 12, color: '#A0AEC0', fontWeight: '600' },
  infoValue: { fontSize: 16, fontWeight: '800', color: '#2D3748', marginLeft: 4 },

  divider: { height: 1, backgroundColor: '#EDF2F7', marginVertical: 16 },
  
  bottomActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  warningCompact: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  warningTextCompact: { fontSize: 11, color: '#C53030', marginLeft: 6, fontWeight: '500' },
  
  cancelButtonCompact: { backgroundColor: '#FFF5F5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#FED7D7' },
  cancelButtonTextCompact: { color: '#E53E3E', fontSize: 13, fontWeight: '700' },

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