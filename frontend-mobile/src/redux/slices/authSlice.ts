import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from "../../types";
import { API_BASE_URL, supabase } from "../../config"; // นำเข้า supabase จาก config เพื่อใช้อัปเดตสถานะ

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

// ฟังก์ชัน Logout แบบ Async เพื่ออัปเดต Database ก่อนล้าง State
export const logoutAsync = createAsyncThunk(
  "auth/logoutAsync",
  async (userId: string | undefined, { dispatch }) => {
    try {
      if (userId) {
        // อัปเดตสถานะใน Database เป็น INACTIVE
        await supabase
          .from('User')
          .update({ status: 'INACTIVE' })
          .eq('id', userId);
      }
    } catch (error) {
      console.error("Failed to update status during logout:", error);
    } finally {
      // ไม่ว่าจะอัปเดต DB สำเร็จหรือไม่ ก็ต้องเคลียร์ข้อมูลในแอป
      await AsyncStorage.multiRemove(['user_token', 'user_data']);
      dispatch(logout()); // เรียก reducer logout ปกติเพื่อล้าง state
    }
  }
);

export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      const data = response.data?.data || response.data;
      const { user, token } = data;
      await AsyncStorage.setItem('user_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      return { user, token };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const registerAsync = createAsyncThunk(
  "auth/register",
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    // เพิ่มฟังก์ชันสำหรับอัปเดตสถานะจาก Realtime Listener
    updateStatusSuccess: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.status = action.payload;
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    updateConsent: (state, action: PayloadAction<boolean>) => {
      if (state.user) state.user.ai_consented = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => { state.isLoading = true; })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { loginSuccess, logout, updateConsent, updateStatusSuccess } = authSlice.actions;
export default authSlice.reducer;