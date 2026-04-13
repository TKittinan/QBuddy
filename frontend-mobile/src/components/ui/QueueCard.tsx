import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Users, Store, ChevronRight } from 'lucide-react-native';

interface QueueCardProps {
  shopName: string;
  queueNumber: string;
  queuesAhead: number;
  waitTime: number;
  onPress?: () => void;
}

export const QueueCard: React.FC<QueueCardProps> = ({ 
  shopName, 
  queueNumber, 
  queuesAhead, 
  waitTime, 
  onPress 
}) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      {/* ส่วนหัว: ชื่อร้าน และ สถานะ */}
      <View style={styles.header}>
        <View style={styles.shopInfo}>
          <Store size={18} color="#4A5568" />
          <Text style={styles.shopName} numberOfLines={1}>{shopName}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>กำลังรอคิว</Text>
        </View>
      </View>

      {/* ส่วนเนื้อหา: เลขคิว */}
      <View style={styles.body}>
        <View style={styles.queueNumberContainer}>
          <Text style={styles.queueLabel}>หมายเลขคิวของคุณ</Text>
          <Text style={styles.queueNumber}>{queueNumber}</Text>
        </View>

        <View style={styles.divider} />

        {/* ส่วนท้าย: จำนวนคิวที่เหลือ และ เวลา */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View style={styles.iconCircleBlue}>
              <Users size={16} color="#3182CE" />
            </View>
            <View style={styles.statTextGroup}>
              <Text style={styles.statLabel}>รออีก</Text>
              <Text style={styles.statValue}>{queuesAhead} คิว</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={styles.iconCircleOrange}>
              <Clock size={16} color="#DD6B20" />
            </View>
            <View style={styles.statTextGroup}>
              <Text style={styles.statLabel}>เวลาประเมิน</Text>
              <Text style={styles.statValue}>~{waitTime} นาที</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 12, 
    elevation: 4, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EDF2F7'
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  shopInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  shopName: { fontSize: 16, fontWeight: '700', color: '#2D3748', marginLeft: 8, flexShrink: 1 },
  statusBadge: { backgroundColor: '#E6FFFA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#38A169', fontSize: 12, fontWeight: '800' },
  body: { backgroundColor: '#F7FAFC', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#EDF2F7' },
  queueNumberContainer: { alignItems: 'center', marginBottom: 16 },
  queueLabel: { fontSize: 13, color: '#718096', marginBottom: 4, fontWeight: '600' },
  queueNumber: { fontSize: 42, fontWeight: '900', color: '#6FA4A1', letterSpacing: 1 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginBottom: 16 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  statBox: { flexDirection: 'row', alignItems: 'center' },
  iconCircleBlue: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EBF8FF', justifyContent: 'center', alignItems: 'center' },
  iconCircleOrange: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFAF0', justifyContent: 'center', alignItems: 'center' },
  statTextGroup: { marginLeft: 10 },
  statLabel: { fontSize: 11, color: '#718096', fontWeight: '500' },
  statValue: { fontSize: 14, fontWeight: '800', color: '#2D3748', marginTop: 1 },
});