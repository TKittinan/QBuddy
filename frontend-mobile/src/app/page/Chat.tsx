import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Users } from 'lucide-react-native';
import { SaveButton } from '../../components/ui/SaveButton';
import { Place } from '../../types';

interface CardProps {
  place?: Place & { distance?: string | number }; 
  onPress: (id: string) => void;
  showBookingBadge?: boolean; 
  title?: string;
  imageUri?: string;
  location?: string;
  distance?: string | number;
  tags?: string[];
  category?: string;
}

export const Card: React.FC<CardProps> = ({ 
  place, 
  title, 
  imageUri, 
  location, 
  distance, 
  category,
  tags, 
  onPress, 
  showBookingBadge 
}) => {
  const displayTitle = place?.name || title || 'Unknown';
  const displayImage = place?.image || imageUri || 'https://via.placeholder.com/400x200';
  const displayLocation = place?.branch || location || 'Unknown Location';
  const displayDistance = place?.distance || distance;
  const displayCategory = place?.category || category || '';
  
  // สร้าง Fallback เสมอ เพื่อให้มั่นใจว่าจะเป็น Array เปล่า (ไม่เป็น undefined)
  const displayTags = place?.tags || tags || []; 
  const placeId = place?.id || 'unknown_id';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={() => onPress(placeId)}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: displayImage }} style={styles.cardImage} />
        
        {showBookingBadge && place?.monthlyBookings !== undefined && place.monthlyBookings > 0 && (
          <View style={styles.bookingBadge}>
            <Users size={12} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.bookingBadgeText}>{place.monthlyBookings.toLocaleString()} จองเดือนนี้</Text>
          </View>
        )}
        
        <SaveButton placeId={placeId} style={styles.saveButton} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.placeName}>{displayTitle}</Text>
        <View style={styles.infoRow}>
          <MapPin size={14} color="#718096" style={{ marginRight: 4 }} />
          <Text style={styles.distanceText}>{displayDistance || 'ไม่ทราบระยะทาง'}</Text>
        </View>
        <View style={styles.tagsRow}>
          {displayCategory ? (
            <Text style={styles.tagText}>{displayCategory}</Text>
          ) : null}
          
          {displayTags.map((tag: string, idx: number) => (
            <Text key={idx} style={styles.tagText}>
              {tag}{idx < displayTags.length - 1 ? '    ' : ''}
            </Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#F1F5F9' },
  imageWrapper: { width: '100%', height: 170, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },
  cardImage: { width: '100%', height: '100%', backgroundColor: '#EDF2F7' },
  bookingBadge: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#DD6B20', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  bookingBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  saveButton: { position: 'absolute', top: 12, right: 12 },
  cardContent: { padding: 16 },
  placeName: { fontSize: 18, fontWeight: '800', color: '#2D3748', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  distanceText: { fontSize: 13, color: '#718096' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tagText: { fontSize: 13, color: '#6FA4A1', fontWeight: '500', marginBottom: 4 }
});