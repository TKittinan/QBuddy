import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../config";
import type { Ticket, TicketStatus } from "../types";

//  สร้าง AsyncThunk สำหรับดึงข้อมูล
export const fetchBookings = createAsyncThunk("booking/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bookings`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch bookings");
  }
});

//  สร้าง AsyncThunk สำหรับอัปเดตสถานะ
export const updateStatusAsync = createAsyncThunk(
  "booking/updateStatus",
  async ({ id, status }: { id: string; status: TicketStatus }, { rejectWithValue }) => {
    try {
      await axios.patch(`${API_BASE_URL}/bookings/${id}/status`, { status });
      return { id, status };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

interface BookingState {
  bookings: Ticket[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    // Reducers ปกติสำหรับจัดการ State ภายใน (ถ้ายังจำเป็นต้องใช้)
    addBooking: (state, action: PayloadAction<Ticket>) => {
      state.bookings.unshift(action.payload);
    },
    deleteBooking: (state, action: PayloadAction<string>) => {
      state.bookings = state.bookings.filter(b => b.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // จัดการ fetchBookings
      .addCase(fetchBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // จัดการ updateStatusAsync
      .addCase(updateStatusAsync.fulfilled, (state, action) => {
        const booking = state.bookings.find(b => b.id === action.payload.id);
        if (booking) booking.status = action.payload.status;
      });
  },
});

export const { addBooking, deleteBooking } = bookingSlice.actions;
export default bookingSlice.reducer;