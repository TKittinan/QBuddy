import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Users, Store } from 'lucide-react-native';
import { SaveButton } from './SaveButton'; 
import { Place } from '../../redux/slices/placeSlice'; // 🌟 นำเข้า Type Place

interface CardProps {
  place: Place; // 🌟 เลิกใช้ any
  onPress: (id: string) => void;
  showBookingBadge?: boolean; 
}

export const Card: React.FC<CardProps> = ({ place, onPress, showBookingBadge }) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onPress(place.id)}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: place.image }} style={styles.cardImage} />
        
        {showBookingBadge && place.monthlyBookings && (
          <View style={styles.bookingBadge}>
            <Users size={12} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.bookingBadgeText}>{place.monthlyBookings.toLocaleString()} จองเดือนนี้</Text>
          </View>
        )}
        
        <SaveButton placeId={place.id} style={styles.saveButton} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.placeName}>{place.name}</Text>
        {place.branch && (
          <View style={styles.branchRow}>
            <Store size={14} color="#718096" style={{ marginRight: 4 }} />
            <Text style={styles.branchText}>สาขา {place.branch}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <MapPin size={14} color="#6FA4A1" style={{ marginRight: 4 }} />
          <Text style={styles.distanceText}>{place.distance}</Text>
        </View>
        <View style={styles.tagsRow}>
          {place.tags?.map((tag: string, idx: number) => (
            <Text key={idx} style={styles.tagText}>{tag}{idx < place.tags.length - 1 ? '    ' : ''}</Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#F1F5F9' },
  imageWrapper: { width: '100%', height: 170, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%' },
  bookingBadge: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#DD6B20', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  bookingBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  saveButton: { position: 'absolute', top: 12, right: 12 },
  cardContent: { padding: 16 },
  placeName: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginBottom: 8 },
  branchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  branchText: { fontSize: 13, color: '#718096', fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  distanceText: { fontSize: 13, color: '#718096' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tagText: { fontSize: 13, color: '#6FA4A1', fontWeight: '500', marginBottom: 4 },
});