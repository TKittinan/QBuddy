import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../config";
import type { Ticket, TicketStatus } from "../types";

//  1. AsyncThunk สำหรับดึงข้อมูลคิวทั้งหมด
export const fetchQueues = createAsyncThunk("queue/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/queues`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch queues");
  }
});

//  2. AsyncThunk สำหรับอัปเดตสถานะคิว (เช่น Serving, Completed, Skipped)
export const updateQueueStatusAsync = createAsyncThunk(
  "queue/updateStatus",
  async ({ id, status }: { id: string; status: TicketStatus }, { rejectWithValue }) => {
    try {
      // ใช้ PATCH เพื่อส่งเฉพาะสถานะที่เปลี่ยนไป
      await axios.patch(`${API_BASE_URL}/queues/${id}/status`, { status });
      return { id, status };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update queue status");
    }
  }
);

//  3. AsyncThunk สำหรับลบคิว (Cancel)
export const deleteQueueAsync = createAsyncThunk("queue/delete", async (id: string, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_BASE_URL}/queues/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete queue");
  }
});

interface QueueState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
}

const initialState: QueueState = {
  tickets: [],
  loading: false,
  error: null,
};

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Queues
      .addCase(fetchQueues.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQueues.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchQueues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Status
      .addCase(updateQueueStatusAsync.fulfilled, (state, action) => {
        const ticket = state.tickets.find(t => t.id === action.payload.id);
        if (ticket) {
          ticket.status = action.payload.status;
        }
      })
      // Delete Queue
      .addCase(deleteQueueAsync.fulfilled, (state, action) => {
        state.tickets = state.tickets.filter(t => t.id !== action.payload);
      });
  },
});

export default queueSlice.reducer;