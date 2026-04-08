import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  rightTopElement?: React.ReactNode; // เติม Prop นี้กลับเข้ามา
  // เปิดช่องให้หน้า Page ส่ง Style มาตกแต่งเพิ่มเติมได้
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const Input: React.FC<InputProps> = ({
  label,
  rightIcon,
  onRightIconPress,
  rightTopElement, // รับค่าที่ส่งมา
  containerStyle,
  inputContainerStyle,
  labelStyle,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      
      {/* จัดการให้อยู่บรรทัดเดียวกัน (Label ซ้าย, rightTopElement ขวา) */}
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

// สไตล์พื้นฐาน (Base Styles)
const styles = StyleSheet.create({
  container: { width: '100%' },
  labelContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }, // เพิ่ม Flex แนวนอน
  label: { fontSize: 13, fontWeight: '700', color: '#4A5568' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 8, backgroundColor: '#FFFFFF' },
  input: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, color: '#2D3748' },
  iconContainer: { paddingHorizontal: 16 },
});