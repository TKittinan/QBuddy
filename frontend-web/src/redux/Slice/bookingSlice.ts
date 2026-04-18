import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import type { Ticket, TicketStatus } from "../../types";

// 1. แก้ไข Endpoint จาก /bookings เป็น /tickets ตาม Backend
// และเพิ่มการรับค่า placeId เพราะ Backend บังคับใช้ route: /tickets/place/:place_id
export const fetchBookings = createAsyncThunk("booking/fetchAll", async (placeId: string, { rejectWithValue }) => {
  try {
    // แก้เป็น /tickets/place/${placeId} ตามบรรทัดที่ 7 ใน ticket_routes.ts
    const response = await axios.get(`${API_BASE_URL}/tickets/place/${placeId}`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch tickets");
  }
});

// 2. แก้ไข Endpoint การอัปเดตสถานะให้ตรงกับ Backend
export const updateStatusAsync = createAsyncThunk(
  "booking/updateStatus",
  async ({ id, status }: { id: string; status: TicketStatus }, { rejectWithValue }) => {
    try {
      // Backend ใช้ PATCH /tickets/:id/status ตามบรรทัดที่ 10 ใน ticket_routes.ts
      await axios.patch(`${API_BASE_URL}/tickets/${id}/status`, { status });
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
    addBooking: (state, action: PayloadAction<Ticket>) => {
      state.bookings.unshift(action.payload);
    },
    deleteBooking: (state, action: PayloadAction<string>) => {
      state.bookings = state.bookings.filter(b => b.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        // ปรับการ Sort ข้อมูลเบื้องต้น
        state.bookings = action.payload.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateStatusAsync.fulfilled, (state, action) => {
        const booking = state.bookings.find(b => b.id === action.payload.id);
        if (booking) booking.status = action.payload.status;
      });
  },
});

export const { addBooking, deleteBooking } = bookingSlice.actions;
export default bookingSlice.reducer;