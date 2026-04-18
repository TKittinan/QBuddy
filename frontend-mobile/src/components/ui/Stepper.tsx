import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

interface StepperProps {
  //Props สำหรับโหมด Numeric Stepper (บวก/ลบเลข ปกติ)
  value?: number;
  onValueChange?: (newValue: number) => void;
  min?: number;
  max?: number;
  size?: 'normal' | 'large';
  
  //Props สำหรับโหมด Wizard Stepper (แถบขั้นตอนในหน้าจองคิว)
  currentStep?: number;
  steps?: string[];
}

export const Stepper: React.FC<StepperProps> = ({ 
  value = 1, 
  onValueChange, 
  min = 1, 
  max = 99, 
  size = 'normal',
  currentStep,
  steps
}) => {
  
  if (steps && currentStep !== undefined) {
    return (
      <View style={styles.wizardContainer}>
        {steps.map((step, index) => {
          const isActive = index + 1 === currentStep;
          const isCompleted = index + 1 < currentStep;
          return (
            <React.Fragment key={index}>
              <View style={styles.stepWrapper}>
                <View style={[styles.stepCircle, (isActive || isCompleted) && styles.stepCircleActive]}>
                  <Text style={[styles.stepNumber, (isActive || isCompleted) && styles.stepNumberActive]}>{index + 1}</Text>
                </View>
                <Text style={[styles.stepText, isActive && styles.stepTextActive]}>{step}</Text>
              </View>
              {index < steps.length - 1 && (
                <View style={[styles.stepLine, isCompleted && styles.stepLineActive]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  }

  const isLarge = size === 'large';
  
  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => value > min && onValueChange && onValueChange(value - 1)}
        disabled={value <= min}
      >
        <Minus size={isLarge ? 28 : 20} color={value <= min ? "#CBD5E0" : "#4A5568"} />
      </TouchableOpacity>
      
      <View style={[styles.valueBox, isLarge && styles.valueBoxLarge]}>
        <Text style={[styles.valueText, isLarge && styles.valueTextLarge]}>{value}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.btn} 
        onPress={() => value < max && onValueChange && onValueChange(value + 1)}
        disabled={value >= max}
      >
        <Plus size={isLarge ? 28 : 20} color={value >= max ? "#CBD5E0" : "#4A5568"} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EDF2F7', padding: 8, alignSelf: 'flex-start' },
  containerLarge: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  btn: { padding: 4 },
  valueBox: { minWidth: 40, alignItems: 'center', justifyContent: 'center' },
  valueBoxLarge: { minWidth: 56 },
  valueText: { fontSize: 16, fontWeight: '700', color: '#2D3748' },
  valueTextLarge: { fontSize: 24, fontWeight: '800' },

  wizardContainer: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', width: '100%', paddingVertical: 10 },
  stepWrapper: { alignItems: 'center', width: 100 },
  stepCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  stepCircleActive: { backgroundColor: '#6FA4A1' },
  stepNumber: { color: '#718096', fontSize: 12, fontWeight: 'bold' },
  stepNumberActive: { color: '#FFFFFF' },
  stepText: { fontSize: 11, color: '#A0AEC0', marginTop: 6, fontWeight: '500', textAlign: 'center' },
  stepTextActive: { color: '#2D3748', fontWeight: '800' },
  stepLine: { height: 2, flex: 1, backgroundColor: '#E2E8F0', marginHorizontal: -10, marginTop: 14 },
  stepLineActive: { backgroundColor: '#6FA4A1' }
});