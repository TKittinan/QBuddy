import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types";
import axios from "axios"; 

const API_URL = "http://localhost:3000/api/users"; 

// Helper สำหรับตั้งค่า Header (แนะนำให้ใช้ Axios Interceptor แทนในระยะยาว)
const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// 1. Actions สำหรับเรียก API
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers", 
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, getAuthConfig());
      return response.data;
    } catch (err: any) {
      // ส่ง Error Message กลับไปแทนที่จะปล่อยให้พังจนเกิด Loop
      return rejectWithValue(err.response?.data?.message || err.message || "Failed to fetch users");
    }
  }
);

export const addUserAsync = createAsyncThunk(
  "users/addUser", 
  async (newUser: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, newUser, getAuthConfig());
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add user");
    }
  }
);

export const updateUserAsync = createAsyncThunk(
  "users/updateUser", 
  async (updatedUser: User, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${updatedUser.id}`, updatedUser, getAuthConfig());
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update user");
    }
  }
);

export const deleteUserAsync = createAsyncThunk(
  "users/deleteUser", 
  async (userId: number | string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${userId}`, getAuthConfig());
      return userId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete user");
    }
  }
);

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
  reducers: {
    // เพิ่ม action สำหรับล้าง error ทิ้ง
    clearError: (state) => {
      state.error = null;
    }
  },
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
        state.error = null; // ล้าง error เมื่อโหลดสำเร็จ
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Access Denied (403)";
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
      .addCase(deleteUserAsync.fulfilled, (state, action: PayloadAction<number | string>) => {
        state.users = state.users.filter((u) => u.id != action.payload);
      });
  },
});

export const { clearError } = userSlice.actions; // Export ออกไปใช้ใน UI
export default userSlice.reducer;