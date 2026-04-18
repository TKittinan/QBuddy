import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface CategoryItemProps {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>; // รองรับการแต่งสไตล์เพิ่มเติมจากหน้า Page
}

export const CategoryItem: React.FC<CategoryItemProps> = ({ 
  label, 
  icon, 
  onPress, 
  containerStyle 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, containerStyle]} 
      activeOpacity={0.7} 
      onPress={onPress}
    >
      <View style={styles.iconWrapper}>
        {icon}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    width: '48%', // พื้นฐานแสดง 2 คอลัมน์
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
});