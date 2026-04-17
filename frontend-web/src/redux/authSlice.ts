import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../config"; // ดึง URL จาก config กลาง

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  // ใช้การเช็คเงื่อนไขที่ปลอดภัยขึ้น
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("user") || "null") : null,
  token: typeof window !== 'undefined' ? localStorage.getItem("token") : null,
  loading: false,
  error: null,
};

export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // ใช้ API_BASE_URL แทนการระบุตรงๆ
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      const { token, user } = response.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { token, user };
    } catch (err: any) {
      // ส่งข้อความ Error กลับไปให้ UI
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null; // เคลียร์ Error เมื่อ Logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    // เพิ่ม Reducer เพื่อเคลียร์ Error ระหว่างเปลี่ยนหน้า
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action: PayloadAction<{ token: string; user: any }>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;