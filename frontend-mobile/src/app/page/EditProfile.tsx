import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../../redux/useRedux';
import { updateProfileAsync } from '../../redux/slices/authSlice';

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // ดึงข้อมูลผู้ใช้ปัจจุบันจาก Redux มาเป็นค่าเริ่มต้น
  const user = useAppSelector((state: any) => state.auth?.user);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');

  const handleSave = async () => {
    // กรองส่งเฉพาะข้อมูลที่ถูกพิมพ์แก้เท่านั้น
    const updateData: any = {};
    if (name.trim() !== user?.name) updateData.name = name;
    if (email.trim() !== user?.email) updateData.email = email;
    if (password.trim().length > 0) updateData.password = password;

    if (Object.keys(updateData).length === 0) {
      Alert.alert('แจ้งเตือน', 'คุณยังไม่ได้แก้ไขข้อมูลใดๆ');
      return;
    }

    try {
      // เรียกใช้ Redux Action เพื่อส่งไป Backend
      await dispatch(updateProfileAsync(updateData)).unwrap();
      Alert.alert('สำเร็จ', 'อัปเดตข้อมูลเรียบร้อยแล้ว');
      router.back(); // บันทึกเสร็จให้เด้งกลับหน้าเดิม
    } catch (error: any) {
      Alert.alert('เกิดข้อผิดพลาด', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput 
          style={styles.input} 
          value={name} 
          onChangeText={setName} 
          placeholder="Enter your name" 
        />

        <Text style={styles.label}>Email</Text>
        <TextInput 
          style={styles.input} 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput 
          style={styles.input} 
          value={password} 
          onChangeText={setPassword} 
          placeholder="Leave blank to keep current password" 
          secureTextEntry 
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: '#EEE' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  formContainer: { padding: 20 },
  label: { fontSize: 14, color: '#333', marginBottom: 8, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16 },
  saveBtn: { backgroundColor: '#2D3748', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});