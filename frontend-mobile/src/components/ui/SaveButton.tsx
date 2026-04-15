import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { toggleSavePlace } from '../../redux/slices/savedPlacesSlice';

// 🌟 1. สร้าง Array ว่างไว้ข้างนอก เพื่อแก้ปัญหา Unnecessary Rerenders
const EMPTY_ARRAY: string[] = [];

interface SaveButtonProps {
  placeId: string;
  style?: StyleProp<ViewStyle>;
  size?: number;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ placeId, style, size = 20 }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: any) => state.auth?.user) || { name: 'Taggsh' };
  
  // 🌟 2. ใช้ EMPTY_ARRAY แทน []
  const savedPlaces = useAppSelector((state: any) => state.savedPlaces?.savedByUser[user.name] || EMPTY_ARRAY);

  const isSaved = savedPlaces.includes(placeId);

  const handleToggleSave = () => {
    dispatch(toggleSavePlace({ username: user.name, placeId }));
  };

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={handleToggleSave}
      activeOpacity={0.8}
    >
      <Bookmark 
        size={size} 
        color={isSaved ? "#D69E2E" : "#4A5568"} 
        fill={isSaved ? "#ECC94B" : "rgba(255,255,255,0.8)"} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center'
  }
});