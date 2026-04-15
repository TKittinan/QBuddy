import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

interface StepperProps {
  value: number;
  onValueChange: (newValue: number) => void;
  min?: number;
  max?: number;
  size?: 'normal' | 'large';
}

export const Stepper: React.FC<StepperProps> = ({ value, onValueChange, min = 1, max = 99, size = 'normal' }) => {
  const isLarge = size === 'large';
  
  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => value > min && onValueChange(value - 1)}
        disabled={value <= min}
      >
        <Minus size={isLarge ? 28 : 20} color={value <= min ? "#CBD5E0" : "#4A5568"} />
      </TouchableOpacity>
      
      <View style={[styles.valueBox, isLarge && styles.valueBoxLarge]}>
        <Text style={[styles.valueText, isLarge && styles.valueTextLarge]}>{value}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => value < max && onValueChange(value + 1)}
        disabled={value >= max}
      >
        <Plus size={isLarge ? 28 : 20} color={value >= max ? "#CBD5E0" : "#4A5568"} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EDF2F7', padding: 8, alignSelf: 'flex-start' },
  containerLarge: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  btn: { padding: 12, backgroundColor: '#F7FAFC', borderRadius: 12 },
  valueBox: { width: 50, alignItems: 'center' },
  valueBoxLarge: { width: 80 },
  valueText: { fontSize: 18, fontWeight: '800', color: '#2D3748' },
  valueTextLarge: { fontSize: 40, fontWeight: '900', marginVertical: 16 },
});