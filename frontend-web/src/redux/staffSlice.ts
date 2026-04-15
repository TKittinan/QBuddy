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

// --- Helper สำหรับดึง Token มาทำเป็น Header ---
const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`, //  ส่ง Token ไปให้ Middleware ตรวจสอบ
    },
  };
};

// --- Async Thunks ---

// 1. ดึงข้อมูลพนักงานทั้งหมด
export const fetchStaffs = createAsyncThunk("staffs/fetchStaffs", async (_, { rejectWithValue }) => {
  try {
    // เพิ่ม getAuthConfig() เป็น argument ที่ 2
    const response = await axios.get("http://localhost:3000/api/admin", getAuthConfig());
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch staffs");
  }
});

// 2. เพิ่มพนักงานใหม่
export const addStaffAsync = createAsyncThunk("staffs/addStaff", async (newStaff: Partial<User>, { rejectWithValue }) => {
  try {
    // สำหรับ POST ต้องใส่ config เป็น argument ที่ 3 (data อยู่ที่ 2)
    const response = await axios.post("http://localhost:3000/api/admin", newStaff, getAuthConfig());
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to add staff");
  }
});

// 3. แก้ไขข้อมูลพนักงาน
export const updateStaffAsync = createAsyncThunk("staffs/updateStaff", async (staff: User, { rejectWithValue }) => {
  try {
    // สำหรับ PUT ต้องใส่ config เป็น argument ที่ 3
    const response = await axios.put(`http://localhost:3000/api/admin/${staff.id}`, staff, getAuthConfig());
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to update staff");
  }
});

// 4. ลบพนักงาน
export const deleteStaffAsync = createAsyncThunk("staffs/deleteStaff", async (id: number | string, { rejectWithValue }) => {
  try {
    // สำหรับ DELETE ต้องใส่ config เป็น argument ที่ 2
    await axios.delete(`http://localhost:3000/api/admin/${id}`, getAuthConfig());
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete staff");
  }
});

const staffSlice = createSlice({
  name: "staffs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Staffs
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
      
      // Add Staff
      .addCase(addStaffAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addStaffAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.staffs.unshift(action.payload);
      })
      .addCase(addStaffAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Staff
      .addCase(updateStaffAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateStaffAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        const index = state.staffs.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.staffs[index] = action.payload;
        }
      })

      // Delete Staff
      .addCase(deleteStaffAsync.fulfilled, (state, action: PayloadAction<number | string>) => {
        state.loading = false;
        state.staffs = state.staffs.filter((s) => s.id != action.payload); // ✅ ใช้ != เพื่อรองรับทั้ง string/number
      })
      .addCase(deleteStaffAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default staffSlice.reducer;