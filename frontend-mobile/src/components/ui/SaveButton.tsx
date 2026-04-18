import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Bookmark } from 'lucide-react-native';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { toggleSavePlaceAsync } from '../../redux/slices/savedPlacesSlice';

const EMPTY_ARRAY: string[] = [];

interface SaveButtonProps {
  placeId: string;
  style?: StyleProp<ViewStyle>;
  size?: number;          
}

export const SaveButton: React.FC<SaveButtonProps> = ({ placeId, style, size = 20 }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: any) => state.auth?.user);
  const userId = user?.id || 'guest-123';
  const savedPlaces = useAppSelector((state: any) => state.savedPlaces?.savedByUser[userId] || EMPTY_ARRAY);
  const isSaved = savedPlaces.includes(placeId);

  const handleToggleSave = () => {
    dispatch(toggleSavePlaceAsync({ userId, placeId }));
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