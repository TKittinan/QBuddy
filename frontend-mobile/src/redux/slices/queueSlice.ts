import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Ticket } from "../../types";

// 🌟 ปรับ URL ให้ตรงกับ Backend Route ที่เราเพิ่งเขียนไป (tickets)
const API_URL = "http://192.168.1.X:5000/api/tickets";

interface QueueState {
  tickets: Ticket[];
  // 🌟 [เพิ่มใหม่] ตัวแปรเก็บสถานะคิวล่าสุด (เวลาที่รอ, จำนวนคิวก่อนหน้า)
  currentStatus: { queuesAhead: number; estimatedWaitTime: number; status: string } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: QueueState = {
  tickets: [],
  currentStatus: null, // 🌟 [เพิ่มใหม่]
  isLoading: false,
  error: null,
};

export const fetchTicketsAsync = createAsyncThunk(
  "queue/fetchTickets",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Fetch error");
    }
  }
);

export const addQueueAsync = createAsyncThunk(
  "queue/addQueue",
  async (ticketData: Ticket, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, ticketData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Add error");
    }
  }
);

export const updateQueueStatusAsync = createAsyncThunk(
  "queue/updateQueueStatus",
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Update error");
    }
  }
);

// 🌟 [เพิ่มใหม่] Thunk สำหรับยิงไปขอเวลาคำนวณคิวจาก Backend
export const fetchQueueStatusAsync = createAsyncThunk(
  "queue/fetchStatus",
  async (ticketId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${ticketId}/status`); 
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch queue status");
    }
  }
);

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    setQueues: (state, action: PayloadAction<Ticket[]>) => {
      state.tickets = action.payload;
    },
    addQueue: (state, action: PayloadAction<Ticket>) => {
      state.tickets.push(action.payload);
    },
    updateQueueStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const ticket = state.tickets.find(t => t.id === action.payload.id);
      if (ticket) ticket.status = action.payload.status;
    },
    deleteQueue: (state, action: PayloadAction<string>) => {
      state.tickets = state.tickets.filter(t => t.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTicketsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTicketsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTicketsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addQueueAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addQueueAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets.push(action.payload);
      })
      .addCase(addQueueAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateQueueStatusAsync.fulfilled, (state, action) => {
        const index = state.tickets.findIndex(t => t.id === action.payload.id);
        if (index !== -1) state.tickets[index] = action.payload;
      })
      // 🌟 [เพิ่มใหม่] จัดการ State ตอนดึงเวลารอคิวสำเร็จ
      .addCase(fetchQueueStatusAsync.fulfilled, (state, action) => {
        state.currentStatus = action.payload;
      });
  }
});

export const { setQueues, addQueue, updateQueueStatus, deleteQueue } = queueSlice.actions;
export default queueSlice.reducer;