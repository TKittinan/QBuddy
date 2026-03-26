import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, MapPin } from 'lucide-react-native';

interface AIChatProps {
  imageUri: string;
  title: string;
  rating: string;
  location: string;
  distance: string;
  tags: string[];
}

export const AIChat: React.FC<AIChatProps> = ({
  imageUri, title, rating, location, distance, tags
}) => {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>✨ AI แนะนำ</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>
        
        <View style={styles.locationRow}>
          <MapPin size={12} color="#718096" />
          <Text style={styles.locationText}>{location} • {distance}</Text>
        </View>

        <View style={styles.tagContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { width: 280, backgroundColor: '#FFFFFF', borderRadius: 20, marginRight: 16, overflow: 'hidden' },
  imageContainer: { width: '100%', height: 160, position: 'relative' },
  image: { width: '100%', height: '100%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  aiBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  aiBadgeText: { fontSize: 10, fontWeight: '700', color: '#38B2AC' },
  content: { padding: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '800', color: '#2D3748', flex: 1 },
  ratingBox: { backgroundColor: '#F7FAFC', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#2D3748' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  locationText: { fontSize: 12, color: '#718096', marginLeft: 4 },
  tagContainer: { flexDirection: 'row' },
  tag: { backgroundColor: '#EDF2F7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 6 },
  tagText: { fontSize: 10, color: '#4A5568', fontWeight: '500' },
});