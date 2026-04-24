import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MapPin, Users } from 'lucide-react-native';
import { SaveButton } from './SaveButton';
import { Place } from '../../types';

interface CardProps {
  place?: Place & { distance?: string | number }; 
  onPress: (id: string) => void;
  showBookingBadge?: boolean; 
  title?: string;
  imageUri?: string;
  location?: string;
  distance?: string | number;
  category?: string; 
}

export const Card: React.FC<CardProps> = ({ 
  place, 
  title, 
  imageUri, 
  location, 
  distance, 
  category, 
  onPress, 
  showBookingBadge 
}) => {
  const displayTitle = place?.name || title || 'Unknown';
  const displayLocation = place?.branch || location || 'Unknown Location';
  const displayDistance = place?.distance || distance;
  const displayCategory = place?.category || category || ''; 
  const placeId = place?.id || 'unknown_id';

  const getCoverImage = () => {
    if (imageUri) return imageUri;
    if (!place) return 'https://via.placeholder.com/400x200';
    
    let imgArray: string[] = [];
    const parseString = (str: string | undefined) => {
      if (!str) return [];
      if (str.startsWith('[') && str.endsWith(']')) {
        try { return JSON.parse(str); } catch (e) { return [str]; }
      }
      if (str.includes(',')) return str.split(',').map(s => s.trim());
      return [str];
    };

    if (place.coverUrl) imgArray = parseString(place.coverUrl);
    if (imgArray.length === 0 && place.image) imgArray = parseString(place.image);
    
    return imgArray[0] || 'https://via.placeholder.com/400x200';
  };

  const displayImage = getCoverImage();

  const categoryTags = displayCategory
    ? displayCategory.split(',').map(c => c.trim()).filter(Boolean)
    : [];

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
        
        {/* 🌟 ปุ่ม Save มุมขวาบน ผูกกับ placeId เรียบร้อย */}
        <SaveButton placeId={placeId} style={styles.saveButton} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.placeName}>{displayTitle}</Text>
        <View style={styles.infoRow}>
          <MapPin size={14} color="#718096" style={{ marginRight: 4 }} />
          <Text style={styles.distanceText}>{displayDistance || 'ไม่ทราบระยะทาง'}</Text>
        </View>

        <View style={styles.tagsRow}>
          {categoryTags.map((cat, index) => (
            <Text key={index} style={styles.tagText}>
              {cat}{index < categoryTags.length - 1 ? '    ' : ''}
            </Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4, borderWidth: 1, borderColor: '#F1F5F9' },
  imageWrapper: { width: '100%', height: 170, borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden', position: 'relative' },
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