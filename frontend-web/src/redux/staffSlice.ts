import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { User } from "../types";

interface StaffState {
  staffs: User[];
  loading: boolean;
  error: string | null;
}

const initialState: StaffState = {
  staffs: [],
  loading: false,
  error: null,
};

// --- Async Thunks ---
export const fetchStaffs = createAsyncThunk("staffs/fetchStaffs", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("http://localhost:5000/api/admin");
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch staffs");
  }
});

export const addStaffAsync = createAsyncThunk("staffs/addStaff", async (newStaff: Partial<User>, { rejectWithValue }) => {
  try {
    const response = await axios.post("http://localhost:5000/api/admin", newStaff);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to add staff");
  }
});

export const updateStaffAsync = createAsyncThunk("staffs/updateStaff", async (staff: User, { rejectWithValue }) => {
  try {
    const response = await axios.put(`http://localhost:5000/api/admin/${staff.id}`, staff);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to update staff");
  }
});

export const deleteStaffAsync = createAsyncThunk("staffs/deleteStaff", async (id: string, { rejectWithValue }) => {
  try {
    await axios.delete(`http://localhost:5000/api/admin/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete staff");
  }
});

const staffSlice = createSlice({
  name: "staffs",
  initialState,
  reducers: {}, // ถ้ายังไม่มี reducer ปกติ ให้ใส่ {} ไว้ครับ
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaffs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffs.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.staffs = action.payload;
      })
      .addCase(fetchStaffs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addStaffAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.staffs.push(action.payload);
      })
      .addCase(updateStaffAsync.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.staffs.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.staffs[index] = action.payload;
      })
      .addCase(deleteStaffAsync.fulfilled, (state, action: PayloadAction<string>) => {
        state.staffs = state.staffs.filter((s) => s.id !== action.payload);
      });
  },
});

export default staffSlice.reducer;