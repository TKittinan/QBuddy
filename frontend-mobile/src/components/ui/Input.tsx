import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, TextStyle, Platform } from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  rightTopElement?: React.ReactNode; 
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  rightIcon,
  onRightIconPress,
  rightTopElement, 
  containerStyle,
  inputContainerStyle,
  labelStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      
      {(label || rightTopElement) && (
        <View style={styles.labelContainer}>
          {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : <View />}
          {rightTopElement && rightTopElement}
        </View>
      )}
      
      <View style={[styles.inputContainer, inputContainerStyle]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#A0AEC0"
          textAlignVertical="center" 
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
  container: { width: '100%' },
  labelContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }, 
  label: { fontSize: 13, fontWeight: '700', color: '#4A5568' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 8, backgroundColor: '#FFFFFF' },
  input: { 
    flex: 1, 
    paddingHorizontal: 16, 
    paddingTop: Platform.OS === 'ios' ? 14 : 12, 
    paddingBottom: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 15,
    color: '#2D3748',
    lineHeight: 22 
  },
  iconContainer: { paddingHorizontal: 16 },
});