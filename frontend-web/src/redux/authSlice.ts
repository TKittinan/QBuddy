import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const LOGIN_URL = "http://localhost:3000/api/auth/login";
const PROFILE_URL = "http://localhost:3000/api/auth/me"; 

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: (() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  })(),
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
};

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return rejectWithValue("No token found");

      const response = await axios.get(PROFILE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // อัปเดตข้อมูลล่าสุดลง LocalStorage เผื่อมีการเปลี่ยน Role จากหน้าอื่น
      localStorage.setItem("user", JSON.stringify(response.data));
      return response.data;
    } catch (err: any) {
      // ถ้า Token หมดอายุ ให้ล้างค่าทิ้งเพื่อป้องกันการค้างของ Role เก่า
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return rejectWithValue(err.response?.data?.message || "Session expired");
    }
  }
);

export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(LOGIN_URL, credentials);
      const { token, user } = response.data;

      // ล้างของเก่าและเซ็ตของใหม่
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { token, user };
    } catch (err: any) {
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
      state.loading = false;
      state.error = null;
      localStorage.clear(); 
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
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
      })
      
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload; // ข้อมูล Tee จะกลับมาตรงนี้
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;