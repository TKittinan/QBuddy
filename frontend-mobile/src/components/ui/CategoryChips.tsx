import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Flame, MapPin } from 'lucide-react-native';

interface CategoryChipsProps {
  tags: string[];
  activeTag: string;
  onTagPress: (tag: string) => void;
  showFlameOn?: string; 
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({ tags, activeTag, onTagPress, showFlameOn }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {tags.map((tag) => (
        <TouchableOpacity 
          key={tag} 
          style={activeTag === tag ? styles.chipActive : styles.chipInactive} 
          onPress={() => onTagPress(tag)}
        >
          {showFlameOn === tag && activeTag === tag ? <Flame size={14} color="#FFFFFF" style={{ marginRight: 6 }} /> : null}
          {activeTag === tag && showFlameOn !== tag ? <MapPin size={14} color="#FFFFFF" style={{ marginRight: 6 }} /> : null}
          <Text style={activeTag === tag ? styles.chipTextActive : styles.chipTextInactive}>{tag}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 4, backgroundColor: '#FFFFFF' },
  chipActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6FA4A1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, marginRight: 10 },
  chipTextActive: { fontSize: 14, color: '#FFFFFF', fontWeight: '700' },
  chipInactive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F7FAFC', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, marginRight: 10, borderWidth: 1, borderColor: '#EDF2F7' },
  chipTextInactive: { fontSize: 14, color: '#4A5568', fontWeight: '600' },
});