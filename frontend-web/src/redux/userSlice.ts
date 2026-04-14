import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types";
import axios from "axios"; 

const API_URL = "http://localhost:3000/api/users"; 

// Helper function สำหรับดึง Token และตั้งค่า Header
const getAuthConfig = () => {
  const token = localStorage.getItem("token"); // ดึง token ที่เซฟไว้ตอน login
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// 1. Actions สำหรับเรียก API (Async Thunks)
// ดึงข้อมูลทั้งหมด
export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const response = await axios.get(API_URL, getAuthConfig());
  return response.data;
});

// เพิ่ม User
export const addUserAsync = createAsyncThunk("users/addUser", async (newUser: Partial<User>) => {
  const response = await axios.post(API_URL, newUser, getAuthConfig());
  return response.data;
});

// แก้ไข User
export const updateUserAsync = createAsyncThunk("users/updateUser", async (updatedUser: User) => {
  const response = await axios.put(`${API_URL}/${updatedUser.id}`, updatedUser, getAuthConfig());
  return response.data;
});

// ลบ User
export const deleteUserAsync = createAsyncThunk("users/deleteUser", async (userId: string) => {
  await axios.delete(`${API_URL}/${userId}`, getAuthConfig());
  return userId;
});

// 2. Initial State
interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

// 3. Slice

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        
        // ถ้าขึ้น 401 อาจจะแปลว่า Token หมดอายุ
        state.error = action.error.message || "Failed to fetch users";
      })

      // Add User
      .addCase(addUserAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.users.push(action.payload);
      })

      // Update User
      .addCase(updateUserAsync.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })

      // Delete User
      .addCase(deleteUserAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export default userSlice.reducer;