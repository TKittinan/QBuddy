import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar, Alert } from 'react-native';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ChevronDown, Users, Check } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useAppSelector, useAppDispatch } from '../../redux/useRedux';
import { addQueueAsync } from '../../redux/slices/queueSlice'; 
import { Stepper } from '../../components/ui/Stepper';

// 🌟 เรียกใช้ Type ที่ถูกต้อง
import { Place, Ticket, TableType, User } from '../../types';

interface AvailableTable extends TableType {
  availableCount: number;
}

export default function QueueBooking() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams();

  // 🌟 บังคับ Type เป็น Array ที่ถูกต้อง โดยไม่ต้องดัก .data ซ้ำซ้อน
  const allPlaces: Place[] = useAppSelector((state: any) => state.places.places);
  const allTickets: Ticket[] = useAppSelector((state: any) => state.queue.tickets);
  const user: User | null = useAppSelector((state: any) => state.auth.user);
  
  const place = allPlaces.find((p: Place) => p.id === id);

  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [selectedTableType, setSelectedTableType] = useState<string | null>(null);
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  if (!place) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><ArrowLeft size={24} color="#1F2937" /></TouchableOpacity></View>
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

  const generateTimeSlots = () => {
    if (!place.openTime || !place.closeTime) return [];
    
    const [openH, openM] = place.openTime.split(':').map(Number);
    const [closeH, closeM] = place.closeTime.split(':').map(Number);
    
    let slots: string[] = [];
    let currentH = openH;
    let currentM = openM;
    
    while (currentH < closeH || (currentH === closeH && currentM <= closeM)) {
      slots.push(`${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`);
      currentM += 30;
      if (currentM >= 60) { currentH++; currentM -= 60; }
    }
    return slots;
  };

  const timeSlots = useMemo(() => generateTimeSlots(), [place]);

  const availableTables: AvailableTable[] = useMemo(() => {
    if (!selectedDate || !selectedTime || !place) return [];
    
    const tableTypes: TableType[] = place.tableTypes || [];
    
    return tableTypes.map((table: TableType) => {
      const bookedCount = allTickets.filter((t: Ticket) => 
        t.shopId === place.id && 
        t.tableType === table.id && 
        t.bookDate === selectedDate && 
        t.bookTime === selectedTime &&
        (t.status === 'Waiting' || t.status === 'Serving')
      ).length;

      return {
        ...table,
        availableCount: Math.max(0, table.capacity - bookedCount)
      };
    });
  }, [selectedDate, selectedTime, place, allTickets]);

  useEffect(() => {
    if (availableTables.length > 0) {
      const autoSelectTable = availableTables.find((t: AvailableTable) => t.availableCount > 0 && t.capacity >= guests);
      if (autoSelectTable && selectedTableType !== autoSelectTable.id) {
        setSelectedTableType(autoSelectTable.id);
      }
    }
  }, [guests, availableTables]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedDate) { Alert.alert("แจ้งเตือน", "กรุณาเลือกวันที่"); return; }
      if (!selectedTime) { Alert.alert("แจ้งเตือน", "กรุณาเลือกเวลา"); return; }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedTableType) { Alert.alert("แจ้งเตือน", "กรุณาเลือกประเภทโต๊ะ"); return; }
      submitBooking();
    }
  };

  const submitBooking = async () => {
    if (!user) {
      Alert.alert("ข้อผิดพลาด", "คุณยังไม่ได้เข้าสู่ระบบ");
      return;
    }

    const newTicket: Partial<Ticket> = {
      name: user.name, 
      guests,
      service: place.category,
      shopId: place.id,
      bookDate: selectedDate!,
      bookTime: selectedTime!,
      status: 'Waiting',
      tableType: selectedTableType,
    };

    try {
      const res = await dispatch(addQueueAsync(newTicket as Ticket)).unwrap();
      if (res && res.id) {
        router.replace({ pathname: '/page/BookingConfirm', params: { ticketId: res.id } });
      }
    } catch (error: any) {
      Alert.alert('เกิดข้อผิดพลาด', error || 'ไม่สามารถจองคิวได้');
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
        {/* @ts-ignore เลี่ยง Type ของฝั่ง Component เก่าที่ยังรับ Props แบบแยก */}
        <Stepper currentStep={currentStep} steps={["วันและเวลา", "จำนวนคน & โต๊ะ"]} />
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
              
              <View style={styles.weekDaysRow}>
                {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
                  <Text key={day} style={styles.weekDayText}>{day}</Text>
                ))}
              </View>
              
              <View style={styles.daysGrid}>
                {generateDaysInMonth().map((dateStr, idx) => {
                  if (!dateStr) return <View key={`empty-${idx}`} style={styles.dayCell} />;
                  const d = new Date(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isPast = d.setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
                  
                  return (
                    <TouchableOpacity 
                      key={dateStr} 
                      disabled={isPast}
                      onPress={() => setSelectedDate(dateStr)}
                      style={[styles.dayCell, isSelected && styles.dayCellSelected, isPast && styles.dayCellDisabled]}
                    >
                      <Text style={[styles.dayText, isSelected && styles.dayTextSelected, isPast && styles.dayTextDisabled]}>
                        {dateStr.split('-')[2]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionMargin}>
              <Text style={styles.sectionTitle}>เลือกเวลา</Text>
              {selectedDate ? (
                <View style={styles.timeGrid}>
                  {timeSlots.map(time => {
                    const isSelected = selectedTime === time;
                    return (
                      <TouchableOpacity key={time} onPress={() => setSelectedTime(time)} style={[styles.timeCell, isSelected && styles.timeCellSelected]}>
                        <Text style={[styles.timeText, isSelected && styles.timeTextSelected]}>{time}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={styles.helperText}>กรุณาเลือกวันที่ก่อน</Text>
              )}
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View>
            <View style={styles.sectionMargin}>
              <Text style={styles.sectionTitle}>จำนวนผู้เข้าใช้บริการ</Text>
              <View style={styles.guestCounterWrapper}>
                <TouchableOpacity onPress={() => setGuests(Math.max(1, guests - 1))} style={styles.counterBtn}>
                  <Text style={styles.counterBtnText}>-</Text>
                </TouchableOpacity>
                <View style={styles.counterValueBox}>
                  <Users size={20} color="#2D3748" style={{ marginRight: 8 }}/>
                  <Text style={styles.counterValue}>{guests}</Text>
                </View>
                <TouchableOpacity onPress={() => setGuests(guests + 1)} style={styles.counterBtn}>
                  <Text style={styles.counterBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionMargin}>
              <Text style={styles.sectionTitle}>เลือกประเภทโต๊ะ</Text>
              <Text style={styles.helperText}>สำหรับวันที่ {selectedDate} เวลา {selectedTime}</Text>

              <View style={{ marginTop: 16 }}>
                <TouchableOpacity activeOpacity={0.8} style={styles.dropdownHeader} onPress={() => setIsTableDropdownOpen(!isTableDropdownOpen)}>
                  <Text style={selectedTableType ? styles.dropdownSelectedText : styles.dropdownPlaceholder}>
                    {selectedTableType ? availableTables.find((t: AvailableTable) => t.id === selectedTableType)?.label || 'เลือกโต๊ะ' : "กรุณาเลือกประเภทโต๊ะ"}
                  </Text>
                  <ChevronDown size={20} color="#718096" style={{ transform: [{ rotate: isTableDropdownOpen ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {isTableDropdownOpen && (
                  <View style={{ marginTop: 8, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EDF2F7', overflow: 'hidden' }}>
                    {availableTables.length > 0 ? availableTables.map((table: AvailableTable, index: number) => {
                      const isFull = table.availableCount === 0;
                      const isSelected = selectedTableType === table.id;
                      
                      return (
                        <TouchableOpacity 
                          key={table.id} 
                          disabled={isFull}
                          onPress={() => { setSelectedTableType(table.id); setIsTableDropdownOpen(false); }}
                          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: index === availableTables.length - 1 ? 0 : 1, borderBottomColor: '#EDF2F7', backgroundColor: isSelected ? '#F0FFF4' : '#FFFFFF', opacity: isFull ? 0.5 : 1 }}
                        >
                          <View>
                            <Text style={isFull ? styles.dropdownItemTextTaken : (isSelected ? styles.dropdownItemTextSelected : styles.dropdownItemText)}>{table.label}</Text>
                            <Text style={styles.tableCapacityText}>สำหรับ {table.capacity} ท่าน</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 13, color: isFull ? '#E53E3E' : '#718096', fontWeight: '600', marginRight: 8 }}>
                              {isFull ? 'คิวเต็มแล้ว' : `ว่าง ${table.availableCount} โต๊ะ`}
                            </Text>
                            {isSelected && <Check size={18} color="#38A169" />}
                          </View>
                        </TouchableOpacity>
                      );
                    }) : (
                      <View style={styles.dropdownEmpty}><Text style={styles.dropdownEmptyText}>ร้านนี้ยังไม่ได้กำหนดประเภทโต๊ะ</Text></View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNextStep}>
          <Text style={styles.nextBtnText}>{currentStep === 1 ? 'ดำเนินการต่อ' : 'ยืนยันการจอง'}</Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 16, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, backgroundColor: '#FFFFFF' },
  backButton: { position: 'absolute', left: 20, top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16, zIndex: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748' },
  stepperContainer: { paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120 },
  calendarContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: '#EDF2F7' },
  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  monthText: { fontSize: 16, fontWeight: '800', color: '#2D3748' },
  weekDaysRow: { flexDirection: 'row', marginBottom: 12 },
  weekDayText: { flex: 1, textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#A0AEC0' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  dayCellSelected: { backgroundColor: '#6FA4A1', borderRadius: 20 },
  dayCellDisabled: { opacity: 0.3 },
  dayText: { fontSize: 15, fontWeight: '600', color: '#4A5568' },
  dayTextSelected: { color: '#FFFFFF', fontWeight: '800' },
  dayTextDisabled: { color: '#CBD5E0' },
  sectionMargin: { marginTop: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginBottom: 8 },
  helperText: { fontSize: 13, color: '#718096' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12 },
  timeCell: { width: '31%', backgroundColor: '#F7FAFC', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#EDF2F7' },
  timeCellSelected: { backgroundColor: '#6FA4A1', borderColor: '#6FA4A1' },
  timeText: { fontSize: 15, fontWeight: '600', color: '#4A5568' },
  timeTextSelected: { color: '#FFFFFF', fontWeight: '800' },
  guestCounterWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, backgroundColor: '#F7FAFC', borderRadius: 24, padding: 8, borderWidth: 1, borderColor: '#EDF2F7' },
  counterBtn: { width: 48, height: 48, backgroundColor: '#FFFFFF', borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  counterBtnText: { fontSize: 24, fontWeight: '600', color: '#4A5568' },
  counterValueBox: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  counterValue: { fontSize: 32, fontWeight: '900', color: '#2D3748' },
  tableList: { marginTop: 16 },
  tableItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#EDF2F7' },
  tableItemSelected: { backgroundColor: '#6FA4A1', borderColor: '#6FA4A1' },
  tableItemDisabled: { opacity: 0.5, backgroundColor: '#EDF2F7' },
  tableItemTitle: { fontSize: 15, color: '#4A5568', fontWeight: '700' },
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
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 20, borderTopWidth: 1, borderTopColor: '#EDF2F7', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  nextBtn: { backgroundColor: '#2D3748', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, borderRadius: 16 },
  nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', marginRight: 8 }
});