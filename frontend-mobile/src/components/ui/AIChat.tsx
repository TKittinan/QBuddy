import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MapPin } from 'lucide-react-native';

interface AIChatProps {
  title: string;
  imageUri: string;
  location: string;
  distance: string | number;
  tags: string[];
  onPress?: () => void;
}

export const AIChat: React.FC<AIChatProps> = ({ title, imageUri, location, distance, tags, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9} 
      onPress={onPress}
      disabled={!onPress}
    >
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        
        <View style={styles.infoRow}>
          <MapPin size={14} color="#6FA4A1" />
          <Text style={styles.infoText}>{location} • {distance}</Text>
        </View>

        <View style={styles.tagsRow}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { width: 240, backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', marginRight: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#EDF2F7' },
  image: { width: '100%', height: 120 },
  content: { padding: 16 },
  title: { fontSize: 16, fontWeight: '800', color: '#2D3748', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { fontSize: 12, color: '#718096', marginLeft: 4, fontWeight: '500' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tagBadge: { backgroundColor: '#EDF2F7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 6, marginBottom: 4 },
  tagText: { fontSize: 11, color: '#4A5568', fontWeight: '700' }
});