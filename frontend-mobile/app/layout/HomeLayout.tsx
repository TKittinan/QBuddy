import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { Mic, Home, Sparkles, ClipboardList, User } from 'lucide-react-native';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/auth/use.Auth';

interface HomeLayoutProps {
  children: React.ReactNode;
}

export const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.userInfoRow}>
          <View>
            <Text style={styles.greetText}>ยินดีต้อนรับกลับ</Text>
            <Text style={styles.userName}>สวัสดี คุณ {user?.name || 'User'}</Text>
          </View>
          <View style={styles.profileWrapper}>
            <Image source={{ uri: 'https://i.pravatar.cc/100' }} style={styles.profileImg} />
            <View style={styles.onlineStatus} />
          </View>
        </View>

        <Input 
          placeholder="อยากทำอะไรวันนี้?"
          inputContainerStyle={styles.searchBar}
          style={{ color: '#FFFFFF' }}
          rightIcon={<Mic size={20} color="#CBD5E0" />}
        />
      </View>

      <View style={styles.content}>
        {children}
      </View>

      <View style={styles.tabBarContainer}>
        <TouchableOpacity style={styles.tabItem}>
          <Home size={24} color="#6FA4A1" />
          <Text style={[styles.tabLabel, { color: '#6FA4A1' }]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
          <Sparkles size={24} color="#A0AEC0" />
          <Text style={styles.tabLabel}>AI / Discover</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <ClipboardList size={24} color="#A0AEC0" />
          <Text style={styles.tabLabel}>Queue</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <User size={24} color="#A0AEC0" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: {
    backgroundColor: '#2D3748',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  userInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetText: { fontSize: 13, color: '#CBD5E0', fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  profileWrapper: { position: 'relative' },
  profileImg: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#38B2AC' },
  onlineStatus: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#48BB78', borderWidth: 2, borderColor: '#2D3748' },
  searchBar: { backgroundColor: 'rgba(255, 255, 255, 0.12)', borderWidth: 0, borderRadius: 12 },
  content: { flex: 1, backgroundColor: '#F7FAFC' },
  tabBarContainer: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 10, marginTop: 4, color: '#A0AEC0', fontWeight: '600' },
});