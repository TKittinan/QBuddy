import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Flame, MapPin } from 'lucide-react-native';

interface CategoryChipsProps {
  tags: string[];
  activeTag: string;
  onTagPress: (tag: string) => void;
  showFlameOn?: string; 
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({ tags, activeTag, onTagPress, showFlameOn }) => {
  return (
    <View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent} 
        style={styles.scroll}
      >
        {tags.map((tag) => {
          const isActive = activeTag === tag;
          const isFlame = showFlameOn === tag;

          return (
            <TouchableOpacity 
              key={tag} 
              style={[styles.chipBase, isActive ? styles.chipActive : styles.chipInactive]} 
              onPress={() => onTagPress(tag)}
              activeOpacity={0.8}
            >
              {isActive && isFlame && <Flame size={16} color="#FFFFFF" style={{ marginRight: 6 }} />}
              {isActive && !isFlame && <MapPin size={16} color="#FFFFFF" style={{ marginRight: 6 }} />}
              <Text style={isActive ? styles.chipTextActive : styles.chipTextInactive}>{tag}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: { backgroundColor: '#FFFFFF', flexGrow: 0 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 4, gap: 10 },
  chipBase: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, justifyContent: 'center' },
  chipActive: { backgroundColor: '#6FA4A1', shadowColor: '#6FA4A1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  chipInactive: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#EDF2F7' },
  chipTextActive: { fontSize: 14, color: '#FFFFFF', fontWeight: '700' },
  chipTextInactive: { fontSize: 14, color: '#718096', fontWeight: '600' },
});