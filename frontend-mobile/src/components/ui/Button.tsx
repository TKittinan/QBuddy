import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, View } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'social' | 'outline';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  icon,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button, 
        variant === 'primary' && styles.primaryButton,
        variant === 'social' && styles.socialButton,
        variant === 'outline' && styles.outlineButton, // สไตล์สำหรับปุ่มขอบเส้น
        style
      ]}
      activeOpacity={0.8}
      {...props}
    >
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={[
        styles.text, 
        variant === 'primary' ? styles.primaryText : styles.secondaryText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, paddingHorizontal: 16 },
  primaryButton: { backgroundColor: '#6FA4A1' },
  socialButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  outlineButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#6FA4A1' },
  text: { fontSize: 14, fontWeight: '700' },
  primaryText: { color: '#FFFFFF' },
  secondaryText: { color: '#4A5568' },
  iconWrapper: { marginRight: 8 },
});