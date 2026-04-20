import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, Platform, StatusBar, RefreshControl } from 'react-native';
import { Store, Clock, Users, AlertCircle, Calendar as CalendarIcon, Ticket as TicketIcon } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router'; 

import { useAppDispatch, useAppSelector } from '../../redux/useRedux';
import { updateQueueStatusAsync, fetchTicketsAsync } from '../../redux/slices/queueSlice'; 
import { fetchPlacesAsync } from '../../redux/slices/placeSlice';

type FilterType = 'active' | 'all' | 'success' | 'cancelled';

export default function QueuePage() {
  const dispatch = useAppDispatch();
  
  const user = useAppSelector((state: any) => state.auth?.user); 
  
  const placesState = useAppSelector((state: any) => state.places);
  const rawPlaces = placesState?.places?.data || placesState?.places || [];
  const places = Array.isArray(rawPlaces) ? rawPlaces : [];
  
  const queueState = useAppSelector((state: any) => state.queue);
  const rawTickets = queueState?.tickets?.data || queueState?.tickets || queueState?.allTickets?.data || queueState?.allTickets || [];
  const allTickets = Array.isArray(rawTickets) ? rawTickets : [];

  const [activeFilter, setActiveFilter] = useState<FilterType>('active');
  const [refreshing, setRefreshing] = useState(false);

  const identifier = user?.email || user?.name;

  // ดึงข้อมูลเฉพาะตอนเปิดหน้านี้เท่านั้น
  useFocusEffect(
    useCallback(() => {
      if (identifier) {
        dispatch(fetchTicketsAsync(identifier));
      }
      if (places.length === 0) {
        dispatch(fetchPlacesAsync());
      }
    }, [dispatch, identifier, places.length])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        identifier ? dispatch(fetchTicketsAsync(identifier)) : Promise.resolve(),
        dispatch(fetchPlacesAsync())
      ]);
    } catch (error) {
      console.error("Refresh failed", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, identifier]);

  const myTickets = allTickets;

  // เพิ่มเงื่อนไขดักจับ กรณีข้อมูลเก่ามากๆ ไม่มี status หลุดมา
  const activeTickets = myTickets.filter((t: any) => !t.status || t.status === 'Waiting' || t.status === 'Serving');
  const historyTickets = myTickets.filter((t: any) => t.status === 'Completed' || t.status === 'Cancelled' || t.status === 'Skipped');

  const handleCancelQueue = (ticketId: string) => {
    Alert.alert('ยกเลิกการจอง', 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคิวนี้?', [
      { text: 'ปิด', style: 'cancel' },
      { 
        text: 'ยืนยันการยกเลิก', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await dispatch(updateQueueStatusAsync({ id: ticketId, status: 'Cancelled' })).unwrap();
            Alert.alert('สำเร็จ', 'ยกเลิกคิวเรียบร้อยแล้ว');
            if (identifier) {
              dispatch(fetchTicketsAsync(identifier));
            }
          } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถยกเลิกคิวได้');
          }
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
    const date = new Date(ticket.createdAt || ticket.bookDate);
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

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6FA4A1" colors={["#6FA4A1"]} />}
      >
        {activeFilter === 'active' ? (
          activeTickets.length > 0 ? (
            <View>
              {activeTickets.map((ticket: any) => {
                const targetPlaceId = ticket.placeId || ticket.shopId;
                const shop = places.find((p: any) => p.id === targetPlaceId) || { name: 'ร้านที่จอง (ข้อมูลเก่า)', logoUrl: 'https://via.placeholder.com/150', tableTypes: [], branch: '' };

                const queuesAhead = allTickets.filter((t: any) => 
                  (t.placeId === targetPlaceId || t.shopId === targetPlaceId) &&
                  t.tableType === ticket.tableType &&
                  t.status === 'Waiting' &&
                  new Date(t.createdAt || t.bookDate) < new Date(ticket.createdAt || ticket.bookDate)
                ).length;

                const isServing = ticket.status === 'Serving';
                const tableName = ticket.tableType || '';

                return (
                  <View key={ticket.id} style={[styles.mainCard, isServing && styles.mainCardServing]}>
                    <View style={styles.shopSection}>
                      <Image source={{ uri: shop.logoUrl }} style={styles.shopImg} />
                      <View style={styles.shopText}>
                        <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                        <View style={styles.locationTag}>
                          <Store size={12} color="#A0AEC0" />
                          <Text style={styles.locationTextSmall}>{shop.branch || 'สาขาหลัก'}</Text>
                        </View>
                      </View>
                      <View style={styles.statusBadgeGreen}>
                        <Text style={styles.statusTextGreen}>{isServing ? 'ถึงคิวแล้ว' : `รอ ${queuesAhead} คิว`}</Text>
                      </View>
                    </View>

                    <View style={styles.queueDetailsRow}>
                      <View>
                        <Text style={styles.queueLabel}>หมายเลขคิว</Text>
                        <Text style={styles.queueNumberDisplay}>{ticket.id}</Text>
                        
                        <View style={styles.guestInfoRow}>
                          {ticket.guests && (
                            <View style={styles.guestPill}>
                              <Users size={12} color="#718096" />
                              <Text style={styles.guestPillText}>{ticket.guests} ท่าน</Text>
                            </View>
                          )}
                          {tableName ? (
                            <View style={styles.guestPill}>
                              <Text style={styles.guestPillText}>{tableName}</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                      
                      <View style={styles.waitTimeBlock}>
                        <Text style={styles.infoLabel}>คิวก่อนหน้า</Text>
                        <View style={styles.timeWrapper}>
                          <Users size={14} color="#DD6B20" />
                          <Text style={styles.infoValue}>{queuesAhead} คิว</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.bottomActionRow}>
                      <View style={styles.warningCompact}>
                        <AlertCircle size={14} color="#E53E3E" />
                        <Text style={styles.warningTextCompact}>กรุณามาถึงร้านก่อน 10 นาที</Text>
                      </View>
                      <TouchableOpacity style={styles.cancelBtnOutline} onPress={() => handleCancelQueue(ticket.id)}>
                        <Text style={styles.cancelBtnTextOutline}>ยกเลิกคิว</Text>
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
                  const targetPlaceId = booking.placeId || booking.shopId;
                  const shop: any = places.find((p: any) => p.id === targetPlaceId) || { name: 'ร้านที่จอง (ข้อมูลเก่า)', logoUrl: 'https://via.placeholder.com/150' };
                  const isSuccess = booking.status === 'Completed';
                  return (
                    <View key={booking.id} style={[styles.historyCard, isSuccess ? styles.historyCardSuccess : styles.historyCardCancelled]}>
                      <View style={styles.historyCardMain}>
                        <Image source={{ uri: shop.logoUrl }} style={styles.historyShopImg} />
                        <View style={styles.historyShopDetails}>
                          <View style={styles.historyShopTitleRow}>
                            <Text style={styles.historyShopName} numberOfLines={1}>{shop.name.split(' (')[0]}</Text>
                            <View style={[styles.historyBadge, isSuccess ? styles.historyBadgeSuccess : styles.historyBadgeCancelled]}>
                              <Text style={[styles.historyBadgeText, isSuccess ? styles.historyBadgeTextSuccess : styles.historyBadgeTextCancelled]}>{isSuccess ? 'สำเร็จ' : 'ยกเลิก'}</Text>
                            </View>
                          </View>
                          <Text style={styles.historyShopCategory}>{booking.service}</Text>
                          <View style={styles.historyTimeRow}>
                            <View style={styles.historyQueueTag}><TicketIcon size={12} color="#4A5568" /><Text style={styles.historyQueueText}>{booking.id}</Text></View>
                            <Text style={styles.historyTimeText}>{new Date(booking.createdAt || booking.bookDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
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
  
  mainCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 16 },
  mainCardServing: { borderColor: '#BEE3F8', borderWidth: 1, shadowColor: '#3182CE' },
  shopSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  shopImg: { width: 48, height: 48, borderRadius: 12 },
  shopText: { marginLeft: 12, flex: 1 },
  shopName: { fontSize: 16, fontWeight: '800', color: '#2D3748' },
  locationTag: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationTextSmall: { fontSize: 13, color: '#A0AEC0', marginLeft: 4 },
  statusBadgeGreen: { backgroundColor: '#F0FFF4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusTextGreen: { color: '#2F855A', fontSize: 12, fontWeight: '800' },

  queueDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  queueLabel: { fontSize: 12, color: '#A0AEC0', fontWeight: '700', marginBottom: 4 },
  queueNumberDisplay: { fontSize: 32, fontWeight: '900', color: '#2D3748', letterSpacing: 0.5, marginBottom: 8 },
  
  guestInfoRow: { flexDirection: 'row' },
  guestPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF2F7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 8 },
  guestPillText: { fontSize: 12, color: '#4A5568', fontWeight: '700', marginLeft: 4 },

  waitTimeBlock: { alignItems: 'flex-end' },
  infoLabel: { fontSize: 12, color: '#A0AEC0', fontWeight: '700', marginBottom: 4 },
  timeWrapper: { flexDirection: 'row', alignItems: 'center' },
  infoValue: { fontSize: 16, fontWeight: '800', color: '#2D3748', marginLeft: 6 },

  divider: { height: 1, backgroundColor: '#EDF2F7', marginVertical: 16 },

  bottomActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  warningCompact: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  warningTextCompact: { fontSize: 12, color: '#E53E3E', marginLeft: 6, fontWeight: '500' },
  cancelBtnOutline: { backgroundColor: '#FFF5F5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#FED7D7' },
  cancelBtnTextOutline: { color: '#E53E3E', fontSize: 13, fontWeight: '700' },

  dateLabel: { fontSize: 12, fontWeight: '700', color: '#718096', marginBottom: 12, marginTop: 8 },
  historyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderRightWidth: 3 },
  historyCardSuccess: { borderRightColor: '#6FA4A1' },
  historyCardCancelled: { borderRightColor: '#E53E3E' },
  historyCardMain: { flexDirection: 'row', alignItems: 'center' },
  historyShopImg: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EDF2F7' },
  historyShopDetails: { flex: 1, marginLeft: 16 },
  historyShopTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyShopName: { fontSize: 15, fontWeight: '800', color: '#2D3748', flex: 1, marginRight: 8 },
  historyShopCategory: { fontSize: 12, color: '#718096', marginTop: 2, marginBottom: 6 },
  historyTimeRow: { flexDirection: 'row', alignItems: 'center' },
  historyQueueTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDF2F7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 8 },
  historyQueueText: { fontSize: 11, fontWeight: '800', color: '#2D3748', marginLeft: 4 },
  historyTimeText: { fontSize: 12, color: '#A0AEC0', fontWeight: '500' },
  historyBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  historyBadgeSuccess: { backgroundColor: '#E6FFFA' },
  historyBadgeTextSuccess: { color: '#38A169' },
  historyBadgeCancelled: { backgroundColor: '#FFF5F5' },
  historyBadgeTextCancelled: { color: '#E53E3E' },
  historyBadgeText: { fontSize: 10, fontWeight: '800' },

  emptyContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 40, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F7FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#718096', textAlign: 'center', marginBottom: 24 },
});