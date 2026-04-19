import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from "../../types";
import { API_BASE_URL, supabase } from "../../config";

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

// ฟังก์ชันสำหรับส่งคำขอรีเซ็ตรหัสผ่านไปยัง Backend
export const forgotPasswordAsync = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      // เรียกใช้ endpoint ที่เราตั้งค่าไว้ใน backend
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to send reset email");
    }
  }
);

export const logoutAsync = createAsyncThunk(
  "auth/logoutAsync",
  async (userId: string | undefined, { dispatch }) => {
    try {
      if (userId) {
        await supabase
          .from('User')
          .update({ status: 'INACTIVE' })
          .eq('id', userId);
      }
    } catch (error) {
      console.error("Failed to update status during logout:", error);
    } finally {
      await AsyncStorage.multiRemove(['user_token', 'user_data']);
      dispatch(logout());
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
      })
      // เพิ่มสถานะการทำงานของ forgotPassword
      .addCase(forgotPasswordAsync.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(forgotPasswordAsync.fulfilled, (state) => { state.isLoading = false; })
      .addCase(forgotPasswordAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { loginSuccess, logout, updateConsent, updateStatusSuccess } = authSlice.actions;
export default authSlice.reducer;