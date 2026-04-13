import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { MapPin, Ticket, Calendar as CalendarIcon, Clock, Users, Store, AlertCircle } from 'lucide-react-native';
import { Button } from '../../components/ui/Button';

type FilterType = 'active' | 'all' | 'success' | 'cancelled';

interface BookingHistory {
  id: string;
  dateLabel: string;
  shopName: string;
  category: string;
  queueNumber: string;
  time: string;
  location: string;
  status: 'success' | 'cancelled';
  image: string;
}

// ==========================================
// 🗄️ [Supabase] TODO: ดึงข้อมูล Mock เหล่านี้จากฐานข้อมูล
// ==========================================

// Mock: ประวัติการจอง (History)
const MOCK_HISTORY: BookingHistory[] = [
  { id: '1', dateLabel: 'Today', shopName: 'Copper Beyond Buffet', category: 'Dining • Thai Cuisine', queueNumber: 'A102', time: '14:30 PM', location: 'The Sense Pinklao 2nd Floor, Borommaratchachonn...', status: 'success', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200' },
  { id: '2', dateLabel: 'Yesterday', shopName: 'After You Dessert Cafe', category: 'Dessert • Cafe', queueNumber: 'B12', time: '2:00 PM', location: 'Siam Square One, Bangkok', status: 'success', image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200' },
  { id: '3', dateLabel: 'Oct 15, 2023', shopName: 'MK Restaurants', category: 'Dining • Suki', queueNumber: 'C08', time: '6:30 PM', location: 'Central World, Bangkok', status: 'cancelled', image: 'https://images.unsplash.com/photo-1526462153549-36224314cfa8?w=200' },
];

// Mock: คิวที่กำลังรออยู่ปัจจุบัน (Active Queue)
const MOCK_ACTIVE_QUEUE = {
  id: 'q_123',
  shopName: 'สุกี้ตี๋น้อย (สาขารัชโยธิน)',
  shopImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500',
  location: 'สาขารัชโยธิน',
  queueNumber: 'A012',
  queuesAhead: 5,
  estimatedWaitTime: 15,
};

export default function QueuePage() {
  // ตั้งค่าเริ่มต้นให้เปิดมาเจอ "คิวที่จอง" ก่อนเลย
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');
  const [activeQueue, setActiveQueue] = useState<typeof MOCK_ACTIVE_QUEUE | null>(MOCK_ACTIVE_QUEUE);

  // 🗄️ [Supabase] TODO: ใช้ useEffect เพื่อ Subscribe Realtime Database ตรงนี้
  // เพื่อให้เลขคิว (queuesAhead) อัปเดตอัตโนมัติโดยไม่ต้องรีเฟรชหน้า

  const handleCancelQueue = () => {
    Alert.alert(
      'ยกเลิกการจอง',
      'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคิวนี้?',
      [
        { text: 'ปิด', style: 'cancel' },
        { 
          text: 'ยืนยันการยกเลิก', 
          style: 'destructive',
          onPress: async () => {
            // 🗄️ [Supabase] TODO: ยิง API ไปอัปเดต status คิวเป็น 'cancelled' ใน Database
            /* const { error } = await supabase
                .from('bookings')
                .update({ status: 'cancelled' })
                .eq('id', activeQueue?.id);
            */
            setActiveQueue(null); // จำลองการลบคิวออกจากหน้าจอ
            Alert.alert('ยกเลิกสำเร็จ', 'ระบบได้ยกเลิกคิวของคุณแล้ว');
          }
        }
      ]
    );
  };

  const filteredHistory = MOCK_HISTORY.filter(item => {
    if (activeFilter === 'all') return true;
    return item.status === activeFilter;
  });

  const groupedHistory = filteredHistory.reduce((acc, item) => {
    if (!acc[item.dateLabel]) acc[item.dateLabel] = [];
    acc[item.dateLabel].push(item);
    return acc;
  }, {} as Record<string, BookingHistory[]>);

  const FilterButton = ({ label, type }: { label: string, type: FilterType }) => {
    const isActive = activeFilter === type;
    return (
      <TouchableOpacity 
        style={[styles.filterBtn, isActive && styles.filterBtnActive]}
        onPress={() => setActiveFilter(type)}
        activeOpacity={0.8}
      >
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>คิวของฉัน</Text>
      </View>

      {/* Filter Tabs (เพิ่ม ScrollView แนวนอน เผื่อจอเล็ก) */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          <FilterButton label="ทั้งหมด" type="all" />
          <FilterButton label="คิวที่จอง" type="active" />
          <FilterButton label="สำเร็จ" type="success" />
          <FilterButton label="ยกเลิก" type="cancelled" />
        </ScrollView>
      </View>

      {/* Content Section */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* =========================================
            🟢 กรณีดู Tab "คิวที่จอง" (Active Queue)
            ========================================= */}
        {activeFilter === 'active' ? (
          activeQueue ? (
            <View>
              <View style={styles.mainCard}>
                <View style={styles.shopSection}>
                  <Image source={{ uri: activeQueue.shopImage }} style={styles.shopImg} />
                  <View style={styles.shopText}>
                    <Text style={styles.shopName} numberOfLines={1}>{activeQueue.shopName}</Text>
                    <View style={styles.locationTag}>
                      <Store size={12} color="#718096" />
                      <Text style={styles.locationTextSmall}>{activeQueue.location}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.queueDisplay}>
                  <Text style={styles.queueLabel}>หมายเลขคิวของคุณคือ</Text>
                  <Text style={styles.queueNumberDisplay}>{activeQueue.queueNumber}</Text>
                  <View style={styles.statusBadgeActive}>
                    <Text style={styles.statusTextActive}>รออีก {activeQueue.queuesAhead} คิว</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <View style={styles.iconCircleBlue}><Users size={20} color="#3182CE" /></View>
                    <Text style={styles.infoLabel}>คิวที่รออยู่</Text>
                    <Text style={styles.infoValue}>{activeQueue.queuesAhead} คิว</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <View style={styles.iconCircleOrange}><Clock size={20} color="#DD6B20" /></View>
                    <Text style={styles.infoLabel}>รอประมาณ</Text>
                    <Text style={styles.infoValue}>~{activeQueue.estimatedWaitTime} นาที</Text>
                  </View>
                </View>
              </View>

              <View style={styles.warningCard}>
                <AlertCircle size={20} color="#E53E3E" />
                <Text style={styles.warningText}>
                  กรุณามาถึงร้านก่อนถึงคิวของคุณประมาณ 10 นาที มิฉะนั้นคิวอาจถูกยกเลิก
                </Text>
              </View>

              <Button title="ดูเมนูอาหาร" variant="outline" style={{ marginBottom: 12, borderColor: '#6FA4A1' }} />
              
              {/* 🌟 แก้ไข: เปลี่ยนจาก Button เป็น TouchableOpacity เพื่อแก้ Error textStyle */}
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancelQueue}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>ยกเลิกการจอง</Text>
              </TouchableOpacity>

            </View>
          ) : (
            // กรณีไม่มีคิวปัจจุบัน
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}><Ticket size={32} color="#A0AEC0" /></View>
              <Text style={styles.emptyTitle}>ไม่มีคิวที่กำลังรอ</Text>
              <Text style={styles.emptySubtitle}>คุณยังไม่ได้ทำการจองคิวร้านใดๆ ในขณะนี้</Text>
            </View>
          )
        ) : (
        /* =========================================
           🕒 กรณีดู Tab "ประวัติการจอง" (History)
           ========================================= */
          filteredHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}><CalendarIcon size={32} color="#A0AEC0" /></View>
              <Text style={styles.emptyTitle}>ยังไม่มีรายการจอง</Text>
              <Text style={styles.emptySubtitle}>คุณยังไม่มีประวัติการทำรายการในหมวดหมู่นี้</Text>
            </View>
          ) : (
            Object.keys(groupedHistory).map((dateKey) => (
              <View key={dateKey}>
                <Text style={styles.dateLabel}>{dateKey}</Text>
                {groupedHistory[dateKey].map((booking) => (
                  <View key={booking.id} style={[styles.card, booking.status === 'success' ? styles.cardSuccess : styles.cardCancelled]}>
                    <View style={styles.cardMain}>
                      <Image source={{ uri: booking.image }} style={styles.shopImageHistory} />
                      <View style={styles.shopDetails}>
                        <View style={styles.shopTitleRow}>
                          <Text style={styles.shopNameHistory} numberOfLines={1}>{booking.shopName}</Text>
                          <View style={[styles.statusBadge, booking.status === 'success' ? styles.badgeSuccess : styles.badgeCancelled]}>
                            <Text style={[styles.statusBadgeText, booking.status === 'success' ? styles.badgeTextSuccess : styles.badgeTextCancelled]}>{booking.status === 'success' ? 'สำเร็จ' : 'ยกเลิก'}</Text>
                          </View>
                        </View>
                        <Text style={styles.shopCategory}>{booking.category}</Text>
                        <View style={styles.queueTimeRow}>
                          <View style={styles.queueTag}><Ticket size={12} color="#4A5568" /><Text style={styles.queueText}>{booking.queueNumber}</Text></View>
                          <Text style={styles.timeText}>{booking.time}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.dividerHistory} />
                    <View style={styles.locationRow}><MapPin size={14} color="#718096" /><Text style={styles.locationText} numberOfLines={1}>{booking.location}</Text></View>
                  </View>
                ))}
              </View>
            ))
          )
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EEF2F4' },
  header: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16, backgroundColor: '#EEF2F4' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748' },
  
  // Filters
  filterWrapper: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#EEF2F4' },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#FFFFFF', marginRight: 8, borderWidth: 1, borderColor: '#EDF2F7' },
  filterBtnActive: { backgroundColor: '#2D3748', borderColor: '#2D3748' },
  filterText: { fontSize: 13, fontWeight: '700', color: '#4A5568' },
  filterTextActive: { color: '#FFFFFF' },
  
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  // 🌟 Active Queue Styles (คิวที่จอง)
  mainCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 15, elevation: 6, marginBottom: 20 },
  shopSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  shopImg: { width: 50, height: 50, borderRadius: 12 },
  shopText: { marginLeft: 14, flex: 1 },
  shopName: { fontSize: 18, fontWeight: '700', color: '#2D3748' },
  locationTag: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationTextSmall: { fontSize: 12, color: '#718096', marginLeft: 4 },
  queueDisplay: { alignItems: 'center', marginVertical: 10 },
  queueLabel: { fontSize: 14, color: '#A0AEC0', fontWeight: '600', marginBottom: 8 },
  queueNumberDisplay: { fontSize: 64, fontWeight: '900', color: '#6FA4A1', letterSpacing: 2 },
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
  
  // 🌟 ปุ่มยกเลิกคิว (เพิ่มใหม่)
  cancelButton: { backgroundColor: '#FFF5F5', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FED7D7' },
  cancelButtonText: { color: '#E53E3E', fontSize: 16, fontWeight: '700' },
  
  // 🕒 History Styles (ประวัติ)
  dateLabel: { fontSize: 12, fontWeight: '700', color: '#718096', marginBottom: 12, marginTop: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, borderRightWidth: 3 },
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
  dividerHistory: { height: 1, backgroundColor: '#EDF2F7', marginVertical: 12 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 12, color: '#718096', marginLeft: 6, flex: 1 },

  // Empty State
  emptyContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 40, alignItems: 'center', justifyContent: 'center', marginTop: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F7FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#718096', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
});