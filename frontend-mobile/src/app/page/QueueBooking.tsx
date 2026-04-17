import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar, Alert } from 'react-native';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ChevronDown, Users, Check } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
// 🌟 1. เปลี่ยนมาใช้ addQueueAsync (ยิงเข้า Backend)
import { addQueueAsync } from '../../redux/slices/queueSlice'; 
import { Stepper } from '../../components/ui/Stepper';
import { Dropdown } from '../../components/ui/Dropdown';

export default function QueueBooking() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams();

  const allPlaces = useAppSelector((state: any) => state.places?.places || []);
  const allTickets = useAppSelector((state: any) => state.queue?.tickets || []);
  const user = useAppSelector((state: any) => state.auth?.user) || { name: 'Taggsh' };
  
  const place = allPlaces.find((p: any) => p.id === id) || { name: 'Shop', openTime: '10:00', closeTime: '22:00', category: 'ร้านอาหาร' };

  const [viewDate, setViewDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); 
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState<number>(2);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const showGuestSelection = place.category === 'ร้านอาหาร' || place.category === 'คาเฟ่';
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    const now = new Date();
    const prev = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    if (prev.getFullYear() < now.getFullYear() || (prev.getFullYear() === now.getFullYear() && prev.getMonth() < now.getMonth())) return;
    setViewDate(prev);
  };
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const checkIsPastDate = (dateNum: number) => new Date(viewDate.getFullYear(), viewDate.getMonth(), dateNum).getTime() < new Date().setHours(0, 0, 0, 0);

  useEffect(() => {
    setSelectedTime(null);
    setSelectedTable(null);
  }, [selectedDate, guestCount]);

  const timeSlots = useMemo(() => {
    let slots = [];
    const [openHour] = (place.openTime || "10:00").split(':').map(Number);
    const [closeHour] = (place.closeTime || "22:00").split(':').map(Number);
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    for (let h = openHour; h < closeHour; h++) {
      for (let min of ['00', '30']) {
        if (isToday && (h < now.getHours() || (h === now.getHours() && parseInt(min) <= now.getMinutes()))) continue; 
        slots.push(`${h.toString().padStart(2, '0')}:${min}`);
      }
    }
    return slots;
  }, [place, selectedDate]);

  const dropdownItems = useMemo(() => {
    return timeSlots.map(time => {
      const dateString = selectedDate.toISOString().split('T')[0];
      const sameSlotBookings = allTickets.filter((t: any) => 
        t.shopId === place.id && t.bookDate?.startsWith(dateString) &&
        t.bookTime === time && t.tableType === selectedTable &&
        (t.status === 'Waiting' || t.status === 'Serving')
      );
      const isFull = showGuestSelection && selectedTable ? sameSlotBookings.length >= 2 : false;
      
      return {
        label: (
          <Text style={[styles.dropdownItemText, selectedTime === time && styles.dropdownItemTextSelected, isFull && styles.dropdownItemTextTaken]}>
            {time} {isFull && '(คิวเต็มแล้ว)'}
          </Text>
        ),
        onClick: () => {
          if (!isFull) setSelectedTime(time);
        }
      };
    });
  }, [timeSlots, showGuestSelection, selectedTable, selectedDate, allTickets, place.id, selectedTime]);

const handleConfirmBooking = () => {
    if (showGuestSelection && !selectedTable) {
      Alert.alert('แจ้งเตือน', 'กรุณาเลือกประเภทโต๊ะที่ต้องการครับ');
      return;
    }
    if (!selectedTime) {
      Alert.alert('แจ้งเตือน', 'กรุณาเลือกเวลาจองครับ');
      return;
    }

    dispatch(addQueueAsync({
      id: '',
      name: user.name, 
      service: place.category, 
      shopId: place.id, 
      status: 'Waiting',
      createdAt: new Date().toISOString(), 
      bookDate: selectedDate.toISOString(), 
      bookTime: selectedTime,
      tableType: selectedTable, 
      guests: showGuestSelection ? guestCount : 1
    })).then((res: any) => {
      // เมื่อจองเสร็จ ส่ง id ที่ได้จาก backend ไปหน้า Confirm
      if(res.payload && res.payload.id) {
         router.push({ pathname: '/page/BookingConfirm', params: { ticketId: res.payload.id } });
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}><ArrowLeft size={24} color="#1F2937" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Queue Booking</Text><View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>1. Select Date</Text>
        <View style={styles.cardContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}><ChevronLeft size={20} color="#2D3748" /></TouchableOpacity>
            <Text style={styles.monthText}>{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}><ChevronRight size={20} color="#2D3748" /></TouchableOpacity>
          </View>
          <View style={styles.daysRow}>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (<Text key={i} style={styles.dayName}>{day}</Text>))}</View>
          <View style={styles.grid}>
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (<View key={`empty-${i}`} style={styles.dateCell} />))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dateNum = i + 1;
              const isPastDate = checkIsPastDate(dateNum);
              const isSelected = selectedDate.getDate() === dateNum && selectedDate.getMonth() === viewDate.getMonth() && selectedDate.getFullYear() === viewDate.getFullYear();
              return (
                <TouchableOpacity key={dateNum} disabled={isPastDate} onPress={() => setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), dateNum))} style={[styles.dateCell, isSelected && styles.dateCellSelected]}>
                  <Text style={[styles.dateText, isPastDate && styles.dateTextDisabled, isSelected && styles.dateTextSelected]}>{dateNum}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {showGuestSelection && (
          <>
            <View style={styles.sectionTitleRow}><Text style={styles.sectionTitle}>2. Number of Guests</Text><Users size={18} color="#A0AEC0" /></View>
            
            <Stepper value={guestCount} onValueChange={setGuestCount} min={1} />

            <Text style={styles.sectionTitle}>3. Select Table</Text>
            <View style={styles.tableGrid}>
              {place.tableTypes?.map((table: any) => {
                const isSelected = selectedTable === table.id;
                const isDisabled = table.capacity < guestCount; 
                
                return (
                  <TouchableOpacity 
                    key={table.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (isDisabled) {
                        Alert.alert("ไม่สามารถเลือกได้", `โต๊ะประเภทนี้รองรับได้แค่ ${table.capacity} ท่าน แต่คุณระบุไว้ ${guestCount} ท่านครับ`);
                      } else {
                        setSelectedTable(table.id);
                      }
                    }}
                    style={[
                      styles.tableItem, 
                      isSelected && styles.tableItemSelected,
                      isDisabled && styles.tableItemDisabled 
                    ]}
                  >
                    <Text style={[styles.tableItemText, isSelected && styles.tableItemTextSelected]}>{table.label}</Text>
                    <Text style={[styles.tableCapacityText, isSelected && {color: '#E6FFFA'}]}>จุได้ {table.capacity} ท่าน</Text>
                    {isSelected && <Check size={16} color="#FFF" style={{ position: 'absolute', right: 12 }} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>{showGuestSelection ? '4. Select Time' : '2. Select Time'}</Text>
        
        {(!showGuestSelection || selectedTable) ? (
          <Dropdown
            trigger={
              <View style={styles.dropdownHeader}>
                <Text style={selectedTime ? styles.dropdownSelectedText : styles.dropdownPlaceholder}>{selectedTime || "เลือกเวลาจอง (ทุกๆ 30 นาที)"}</Text>
                <ChevronDown size={20} color="#718096" />
              </View>
            }
            items={dropdownItems}
          />
        ) : (
          <View style={styles.dropdownEmpty}><Text style={styles.dropdownEmptyText}>กรุณาเลือกประเภทโต๊ะก่อนเลือกเวลา</Text></View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.confirmBtn, (!selectedTime || (showGuestSelection && !selectedTable)) && styles.confirmBtnDisabled]} disabled={!selectedTime || (showGuestSelection && !selectedTable)} onPress={handleConfirmBooking}>
          <Text style={styles.confirmBtnText}>ยืนยันการจอง</Text>
          <ArrowRight size={20} color="#FFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  content: { paddingHorizontal: 20, paddingBottom: 150 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 8, paddingRight: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#2D3748', marginTop: 24, marginBottom: 12 },
  cardContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#EDF2F7' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 8 },
  navButton: { padding: 4 },
  monthText: { fontSize: 15, fontWeight: '800', color: '#2D3748' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  dayName: { fontSize: 12, color: '#A0AEC0', fontWeight: '700', width: 32, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dateCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  dateCellSelected: { backgroundColor: '#6FA4A1', borderRadius: 20 },
  dateText: { fontSize: 14, fontWeight: '600', color: '#2D3748' },
  dateTextDisabled: { color: '#CBD5E0' },
  dateTextSelected: { color: '#FFFFFF', fontWeight: '800' },
  
  tableGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tableItem: { width: '48%', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDF2F7', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 12, marginBottom: 12, alignItems: 'flex-start', justifyContent: 'center', position: 'relative' },
  tableItemSelected: { backgroundColor: '#6FA4A1', borderColor: '#6FA4A1' },
  tableItemDisabled: { backgroundColor: '#F7FAFC', opacity: 0.5 },
  tableItemText: { fontSize: 14, color: '#4A5568', fontWeight: '700' },
  tableItemTextSelected: { color: '#FFFFFF', fontWeight: '800' },
  tableCapacityText: { fontSize: 11, color: '#A0AEC0', marginTop: 2 },

  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDF2F7', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16 },
  dropdownPlaceholder: { fontSize: 15, color: '#A0AEC0', fontWeight: '500' },
  dropdownSelectedText: { fontSize: 15, color: '#2D3748', fontWeight: '800' },
  dropdownItemText: { fontSize: 15, color: '#4A5568', fontWeight: '600' },
  dropdownItemTextSelected: { color: '#6FA4A1', fontWeight: '800' },
  dropdownItemTextTaken: { color: '#E53E3E', textDecorationLine: 'line-through' },
  dropdownEmpty: { padding: 20, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EDF2F7' },
  dropdownEmptyText: { color: '#A0AEC0', fontSize: 14 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 30 : 20, borderTopWidth: 1, borderTopColor: '#EDF2F7' },
  confirmBtn: { flexDirection: 'row', backgroundColor: '#6FA4A1', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  confirmBtnDisabled: { backgroundColor: '#A0AEC0' },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});