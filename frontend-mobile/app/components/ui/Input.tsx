import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, TouchableOpacity } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  rightTopElement?: React.ReactNode; 
}

export const Input: React.FC<InputProps> = ({
  label,
  rightIcon,
  onRightIconPress,
  rightTopElement,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {rightTopElement && rightTopElement}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#A0AEC0"
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.iconContainer} activeOpacity={0.7} disabled={!onRightIconPress}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16, width: '100%' },
  labelContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '700', color: '#4A5568' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 8, backgroundColor: '#FFFFFF' },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#2D3748' },
  iconContainer: { paddingHorizontal: 16 },
});