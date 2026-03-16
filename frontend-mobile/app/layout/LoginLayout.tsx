import React, { ReactNode } from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

interface LoginLayoutProps {
  children: ReactNode;
}

export const AuthLayout: React.FC<LoginLayoutProps> = ({ children }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#EEF2F4' // สีพื้นหลังเทาอมฟ้าอ่อนๆ ตามดีไซน์
  }, 
  container: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingHorizontal: 24, 
    paddingTop: 40, 
    paddingBottom: 40,
    justifyContent: 'center'
  },
});