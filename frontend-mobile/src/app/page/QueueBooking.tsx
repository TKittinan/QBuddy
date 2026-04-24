import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ChevronDown, Users, Check, LayoutGrid } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

import { useAppSelector, useAppDispatch } from '../../redux/useRedux';
import { addQueueAsync } from '../../redux/slices/queueSlice'; 
import { Stepper as CustomStepper } from '../../components/ui/Stepper';
import { API_BASE_URL } from "../../config";

import { Place, Ticket, TableType, User } from '../../types';

interface AvailableTable extends TableType {
  availableCount: number;
}

// Function สำหรับดึงตัวเลขจำนวนคนสูงสุดจาก label ของโต๊ะ
const getMaxGuestsFromLabel = (label?: string) => {
  if (!label) return 2;
  const nums = label.match(/\d+/g);
  if (nums && nums.length > 0) {
    return parseInt(nums[nums.length - 1], 10);
  }
  return 2; 
};

export default function QueueBooking() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams();

  const allPlaces: Place[] = useAppSelector((state: any) => state.places.places);
  const user: User | null = useAppSelector((state: any) => state.auth.user);
  
  const place = allPlaces.find((p: Place) => p.id === id);

  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);

  const [selectedTableType, setSelectedTableType] = useState<string | null>(null);
  const [tableCount, setTableCount] = useState<number>(1);
  const [guests, setGuests] = useState<number>(2);
  const [currentStep, setCurrentStep] = useState(1);
  
  //เพิ่ม State ป้องกันการกดจองเบิ้ล
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeBookings, setActiveBookings] = useState<any[]>([]);

  // ดึงข้อมูลการจองที่ active อยู่เพื่อนำมาคำนวณจำนวนโต๊ะว่าง
  useEffect(() => {
    if (!place?.id) return;
    axios.get(`${API_BASE_URL}/tickets/active-bookings?shopId=${place.id}`)
      .then(res => setActiveBookings(res.data || []))
      .catch(err => console.error("Fetch active bookings failed", err));
  }, [place?.id]);

  if (!place) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#1F2937" /></TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>ไม่พบข้อมูลร้าน</Text></View>
      </SafeAreaView>
    );
  }

  const generateDaysInMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    let days: (string | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  // รองรับร้านที่เปิดข้ามคืน (เช่น Suki Teenoi)
  const generateTimeSlots = () => {
    if (!place.openTime || !place.closeTime) return [];
    const [openH, openM] = place.openTime.split(':').map(Number);
    let [closeH, closeM] = place.closeTime.split(':').map(Number);
    
    // ถ้าร้านปิดหลังเที่ยงคืน (เวลาปิดน้อยกว่าเวลาเปิด) ให้บวก 24 ชม.
    if (closeH < openH) {
      closeH += 24;
    }
    
    let slots: string[] = [];
    let currentH = openH;
    let currentM = openM;
    
    while (currentH < closeH || (currentH === closeH && currentM <= closeM)) {
      // แปลงเวลากลับมาให้อยู่ในรูปแบบ 00-23
      const displayH = currentH >= 24 ? currentH - 24 : currentH;
      slots.push(`${displayH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`);
      
      currentM += 30;
      if (currentM >= 60) { currentH++; currentM -= 60; }
    }
    return slots;
  };

  const timeSlots = useMemo(() => generateTimeSlots(), [place]);

  const timeSlotAvailability = useMemo(() => {
    if (!selectedDate) return [];
    const bookingsForDate = activeBookings.filter(t => t.bookDate === selectedDate);
    return timeSlots.map(time => {
      if (!place.tableTypes || place.tableTypes.length === 0) return { time, isFull: true };

      const isFull = place.tableTypes?.every((tt: any) => {
        const bookedSum = bookingsForDate
          .filter(t => t.bookTime === time && t.tableType === tt.label)
          .reduce((sum, t) => sum + (t.tableCount || 1), 0);
        return bookedSum >= (tt.capacity || 1); 
      });
      return { time, isFull };
    });
  }, [selectedDate, timeSlots, place, activeBookings]);

  const isDayFull = useCallback((dateStr: string) => {
    if (timeSlots.length === 0) return true;
    
    if (!place.tableTypes || place.tableTypes.length === 0) return true;

    const bookingsForDate = activeBookings.filter(t => t.bookDate === dateStr);
    return timeSlots.every(time => {
      return place.tableTypes?.every((tt: any) => {
        const bookedSum = bookingsForDate
          .filter(t => t.bookTime === time && t.tableType === tt.label)
          .reduce((sum, t) => sum + (t.tableCount || 1), 0);
        return bookedSum >= (tt.capacity || 1);
      });
    });
  }, [timeSlots, place, activeBookings]);

  const availableTables: AvailableTable[] = useMemo(() => {
    if (!selectedDate || !selectedTime || !place) return [];
    return (place.tableTypes || []).map((table: any) => {
      const bookedSum = activeBookings
        .filter(t => t.bookDate === selectedDate && t.bookTime === selectedTime && t.tableType === table.label)
        .reduce((sum, t) => sum + (t.tableCount || 1), 0);
      return { ...table, availableCount: Math.max(0, (table.capacity || 1) - bookedSum) };
    });
  }, [selectedDate, selectedTime, place, activeBookings]);

  useEffect(() => {
    setTableCount(1);
  }, [selectedTableType]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedDate) return Alert.alert("แจ้งเตือน", "กรุณาเลือกวันที่");
      if (!selectedTime) return Alert.alert("แจ้งเตือน", "กรุณาเลือกรอบเวลา");
      setCurrentStep(2);
    } else {
      submitBooking();
    }
  };

  const submitBooking = async () => {
    if (!user) return Alert.alert("ข้อผิดพลาด", "คุณยังไม่ได้เข้าสู่ระบบ");
    const selectedTableObj = availableTables.find(t => t.id === selectedTableType);
    if (!selectedTableObj) return Alert.alert("แจ้งเตือน", "กรุณาเลือกประเภทโต๊ะ");

    const maxGuestsPerTable = getMaxGuestsFromLabel(selectedTableObj.label);
    const maxGuestsTotal = maxGuestsPerTable * tableCount;
    
    if (guests > maxGuestsTotal) {
      return Alert.alert("แจ้งเตือน", `โต๊ะจำนวน ${tableCount} ตัว รองรับได้สูงสุด ${maxGuestsTotal} ท่าน`);
    }

    setIsSubmitting(true); // เริ่มสถานะโหลด
    
    const newTicket: Omit<Ticket, 'id' | 'createdAt'> = {
      name: user.name, 
      email: user.email || '',
      guests, 
      service: place.category, 
      shopId: place.id,
      bookDate: selectedDate!, 
      bookTime: selectedTime!, 
      status: 'Waiting',
      tableType: selectedTableObj.label, 
      tableCount: tableCount
    };

    try {
      const res = await dispatch(addQueueAsync(newTicket)).unwrap();
      const finalId = res?.data?.id || res?.id;
      
      if (!finalId) {
        throw new Error("ไม่ได้รับรหัสคิวจากระบบ กรุณาลองใหม่อีกครั้ง");
      }
      
      router.replace({ pathname: '/page/BookingConfirm', params: { ticketId: finalId } });
    } catch (error: any) {
      Alert.alert('เกิดข้อผิดพลาด', error.message || error || 'ไม่สามารถจองคิวได้');
    } finally {
      setIsSubmitting(false); // คืนสถานะโหลด
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => currentStep === 2 ? setCurrentStep(1) : router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>จองคิว: {place.name}</Text>
      </View>

      <View style={styles.stepperContainer}>
        <View style={styles.stepIndicatorContainer}>
          <View style={styles.stepBox}>
            <View style={[styles.stepCircle, currentStep >= 1 ? styles.stepCircleActive : styles.stepCircleInactive]}>
              <Text style={[styles.stepCircleText, currentStep >= 1 && styles.stepCircleTextActive]}>1</Text>
            </View>
            <Text style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}>วันและเวลา</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepBox}>
            <View style={[styles.stepCircle, currentStep >= 2 ? styles.stepCircleActive : styles.stepCircleInactive]}>
              <Text style={[styles.stepCircleText, currentStep >= 2 && styles.stepCircleTextActive]}>2</Text>
            </View>
            <Text style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}>จำนวนคน & โต๊ะ</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {currentStep === 1 && (
          <View>
            <View style={styles.calendarContainer}>
              <View style={styles.monthSelector}>
                <TouchableOpacity onPress={handlePrevMonth}><ChevronLeft size={24} color="#4A5568" /></TouchableOpacity>
                <Text style={styles.monthText}>{viewDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}</Text>
                <TouchableOpacity onPress={handleNextMonth}><ChevronRight size={24} color="#4A5568" /></TouchableOpacity>
              </View>
              <View style={styles.weekDaysRow}>{['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => <Text key={day} style={styles.weekDayText}>{day}</Text>)}</View>
              <View style={styles.daysGrid}>
                {generateDaysInMonth().map((dateStr, idx) => {
                  if (!dateStr) return <View key={`empty-${idx}`} style={styles.dayCell} />;
                  const d = new Date(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isPast = d.setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
                  const fullyBooked = !isPast && isDayFull(dateStr); 
                  return (
                    <TouchableOpacity key={dateStr} disabled={isPast || fullyBooked} onPress={() => { setSelectedDate(dateStr); setSelectedTime(null); setIsTimeDropdownOpen(false); }} style={[styles.dayCell, isSelected && styles.dayCellSelected, (isPast || fullyBooked) && styles.dayCellDisabled]}>
                      <Text style={[styles.dayText, isSelected && styles.dayTextSelected, isPast && styles.dayTextDisabled, fullyBooked && { color: '#E53E3E' }]}>{dateStr.split('-')[2]}</Text>
                      {fullyBooked && <Text style={{ fontSize: 9, color: '#E53E3E', marginTop: 2, fontWeight: 'bold' }}>เต็ม</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={styles.sectionMargin}>
              <Text style={styles.sectionTitle}>เลือกเวลา</Text>
              <TouchableOpacity activeOpacity={0.8} style={[styles.dropdownHeader, !selectedDate && { backgroundColor: '#F7FAFC' }]} disabled={!selectedDate} onPress={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}>
                <Text style={selectedTime ? styles.dropdownSelectedText : styles.dropdownPlaceholder}>{selectedDate ? (selectedTime ? `${selectedTime} น.` : 'คลิกเพื่อเลือกรอบเวลา') : "รอเลือกวันที่"}</Text>
                <ChevronDown size={20} color="#A0AEC0" style={{ transform: [{ rotate: isTimeDropdownOpen ? '180deg' : '0deg' }] }} />
              </TouchableOpacity>
              {isTimeDropdownOpen && selectedDate && (
                <View style={styles.dropdownMenu}>
                  {timeSlotAvailability.map((slot, index) => (
                    <TouchableOpacity key={slot.time} disabled={slot.isFull} onPress={() => { setSelectedTime(slot.time); setIsTimeDropdownOpen(false); }} style={[styles.dropdownItem, index === timeSlotAvailability.length - 1 && { borderBottomWidth: 0 }, slot.isFull && { backgroundColor: '#F7FAFC', opacity: 0.6 }]}>
                      <Text style={[slot.isFull ? styles.dropdownItemTextTaken : (selectedTime === slot.time ? styles.dropdownItemTextSelected : styles.dropdownItemText)]}>{slot.time} น. {slot.isFull ? '(เต็ม)' : ''}</Text>
                      {selectedTime === slot.time && !slot.isFull && <Check size={18} color="#2D3748" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View>
            <View style={styles.sectionMargin}>
              <Text style={styles.sectionTitle}>เลือกประเภทโต๊ะ</Text>
              {availableTables.length > 0 ? availableTables.map((table: AvailableTable) => {
                const isFull = table.availableCount <= 0;
                const isSelected = selectedTableType === table.id;
                const maxPer = getMaxGuestsFromLabel(table.label);
                return (
                  <TouchableOpacity key={table.id} disabled={isFull} onPress={() => setSelectedTableType(table.id)} style={[styles.tableCard, isSelected && styles.tableCardSelected, isFull && styles.tableCardDisabled]}>
                    <View><Text style={[styles.tableCardTitle, isSelected && styles.tableCardTitleSelected, isFull && { color: '#A0AEC0' }]}>{table.label}</Text>
                    <Text style={styles.tableCapacityText}>รองรับ {maxPer} ท่าน / 1 โต๊ะ</Text></View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {isFull ? <Text style={styles.bookedText}>มีการจองแล้ว</Text> : <Text style={{ fontSize: 13, color: '#718096', fontWeight: '600', marginRight: 8 }}>ว่าง {table.availableCount} โต๊ะ</Text>}
                      {isSelected && !isFull && <Check size={20} color="#2D3748" />}
                    </View>
                  </TouchableOpacity>
                );
              }) : (
                <View style={{ padding: 20, alignItems: 'center', backgroundColor: '#F7FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#EDF2F7' }}><Text style={{ color: '#A0AEC0', fontSize: 14 }}>ร้านนี้ไม่มีประเภทโต๊ะ</Text></View>
              )}
            </View>
            {selectedTableType && (
              <View style={styles.sectionMargin}>
                <View style={styles.headerWithIcon}><LayoutGrid size={20} color="#4A5568" /><Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: 8 }]}>จำนวนโต๊ะที่ต้องการ</Text></View>
                <View style={styles.stepperWrapper}><CustomStepper value={tableCount} onValueChange={setTableCount} min={1} max={availableTables.find(t => t.id === selectedTableType)?.availableCount || 1} /></View>
              </View>
            )}
            <View style={styles.sectionMargin}>
              <View style={styles.headerWithIcon}><Users size={20} color="#4A5568" /><Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: 8 }]}>จำนวนผู้เข้าใช้บริการ</Text></View>
              <View style={styles.stepperWrapper}><CustomStepper value={guests} onValueChange={setGuests} min={1} max={selectedTableType ? getMaxGuestsFromLabel(availableTables.find(t => t.id === selectedTableType)?.label) * tableCount : 10} /></View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.nextBtn, isSubmitting && { opacity: 0.7 }]} 
          onPress={handleNextStep}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />
          ) : null}
          <Text style={styles.nextBtnText}>
            {currentStep === 1 ? 'ดำเนินการต่อ' : (isSubmitting ? 'กำลังจองคิว...' : 'ยืนยันการจอง')}
          </Text>
          {(!isSubmitting && currentStep === 1) && <ArrowRight size={20} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16 },
  backButton: { position: 'absolute', left: 20, top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748' },
  stepperContainer: { paddingHorizontal: 40, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  stepIndicatorContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 },
  stepBox: { alignItems: 'center' },
  stepCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  stepCircleActive: { backgroundColor: '#6FA4A1' },
  stepCircleInactive: { backgroundColor: '#EDF2F7' },
  stepCircleText: { fontSize: 14, fontWeight: '800' },
  stepCircleTextActive: { color: '#FFFFFF' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#EDF2F7', marginHorizontal: 16, marginBottom: 20 },
  stepLabel: { fontSize: 12, fontWeight: '600', color: '#A0AEC0' },
  stepLabelActive: { color: '#2D3748' },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 },
  calendarContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, elevation: 3, borderWidth: 1, borderColor: '#EDF2F7' },
  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  monthText: { fontSize: 16, fontWeight: '800', color: '#2D3748' },
  weekDaysRow: { flexDirection: 'row', marginBottom: 12 },
  weekDayText: { flex: 1, textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#A0AEC0' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  dayCellSelected: { backgroundColor: '#344054', borderRadius: 12 }, 
  dayCellDisabled: { opacity: 0.3 },
  dayText: { fontSize: 15, fontWeight: '600', color: '#4A5568' },
  dayTextSelected: { color: '#FFFFFF', fontWeight: '800' },
  dayTextDisabled: { color: '#CBD5E0' },
  sectionMargin: { marginTop: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginBottom: 4 },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDF2F7', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16 },
  dropdownPlaceholder: { fontSize: 15, color: '#A0AEC0' },
  dropdownSelectedText: { fontSize: 15, color: '#2D3748', fontWeight: '800' },
  dropdownMenu: { marginTop: 8, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EDF2F7', overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  dropdownItemText: { fontSize: 15, color: '#4A5568' },
  dropdownItemTextSelected: { color: '#2D3748', fontWeight: '800' },
  dropdownItemTextTaken: { color: '#E53E3E', textDecorationLine: 'line-through' },
  tableCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDF2F7' },
  tableCardSelected: { borderColor: '#2D3748', backgroundColor: '#F7FAFC' },
  tableCardDisabled: { backgroundColor: '#F7FAFC', opacity: 0.6 },
  tableCardTitle: { fontSize: 16, color: '#4A5568', fontWeight: '700' },
  tableCardTitleSelected: { color: '#2D3748', fontWeight: '800' },
  tableCapacityText: { fontSize: 12, color: '#A0AEC0', marginTop: 4 },
  bookedText: { fontSize: 13, fontWeight: '700', color: '#E53E3E' },
  headerWithIcon: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  stepperWrapper: { marginTop: 12, backgroundColor: '#F7FAFC', padding: 16, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 32 : 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#EDF2F7' },
  nextBtn: { backgroundColor: '#344054', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16 }, 
  nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginRight: 8 }
});