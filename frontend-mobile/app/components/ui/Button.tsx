import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, View } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'social';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  icon,
  style,
  ...props
}) => {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[styles.button, isPrimary ? styles.primaryButton : styles.socialButton, style]}
      activeOpacity={0.8}
      {...props}
    >
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={[styles.text, isPrimary ? styles.primaryText : styles.socialText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 8, width: '100%', marginBottom: 12 },
  primaryButton: { backgroundColor: '#6FA4A1' },
  socialButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0' },
  text: { fontSize: 14, fontWeight: '700' },
  primaryText: { color: '#FFFFFF' },
  socialText: { color: '#4A5568' },
  iconWrapper: { marginRight: 8 },
});