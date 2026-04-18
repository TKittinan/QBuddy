import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import type { User } from "../../types";

//  1. AsyncThunk สำหรับดึงข้อมูลผู้ใช้ทั้งหมด
export const fetchUsers = createAsyncThunk("users/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch users");
  }
});

//  2. AsyncThunk สำหรับเพิ่มผู้ใช้ใหม่
export const addUserAsync = createAsyncThunk("users/add", async (newUser: Partial<User>, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users`, newUser);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to add user");
  }
});

// 🌟 3. AsyncThunk สำหรับอัปเดตข้อมูลผู้ใช้ (เพิ่มส่วนนี้)
export const updateUserAsync = createAsyncThunk(
  "users/update",
  async (user: User, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${user.id}`, user);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update user");
    }
  }
);

//  4. AsyncThunk สำหรับลบผู้ใช้
export const deleteUserAsync = createAsyncThunk("users/delete", async (id: string, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_BASE_URL}/users/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete user");
  }
});

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

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add User
      .addCase(addUserAsync.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      // 🌟 Update User (เพิ่มส่วนนี้)
      .addCase(updateUserAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        // หาตำแหน่ง User ใน Array แล้วอัปเดตข้อมูลใหม่เข้าไป
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete User
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export default userSlice.reducer;