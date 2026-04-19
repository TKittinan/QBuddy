import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Ticket } from "../../types";
import { API_BASE_URL } from "../../config";

interface QueueState {
  tickets: Ticket[];
  currentStatus: { queuesAhead: number; estimatedWaitTime: number; status: string } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: QueueState = {
  tickets: [],
  currentStatus: null, 
  isLoading: false,
  error: null,
};

// 🌟 แก้ไข: บังคับให้รับค่า userName และยิงไปที่ API ใหม่
export const fetchTicketsAsync = createAsyncThunk(
  "queue/fetchTickets",
  async (userName: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/user/${encodeURIComponent(userName)}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Fetch error");
    }
  }
);

export const addQueueAsync = createAsyncThunk(
  "queue/addQueue",
  async (ticketData: Omit<Ticket, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/tickets`, ticketData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Add error");
    }
  }
);

export const updateQueueStatusAsync = createAsyncThunk(
  "queue/updateStatus",
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/tickets/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Update error");
    }
  }
);

export const fetchQueueStatusAsync = createAsyncThunk(
  "queue/fetchStatus",
  async (ticketId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/${ticketId}/status`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch status");
    }
  }
);

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    addQueue: (state, action: PayloadAction<Ticket>) => {
      state.tickets.push(action.payload);
    },
    updateQueueStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const index = state.tickets.findIndex(t => t.id === action.payload.id);
      if (index !== -1) state.tickets[index].status = action.payload.status;
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
        state.tickets = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
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
        const newTicket = action.payload?.data || action.payload;
        state.tickets.push(newTicket);
      })
      .addCase(addQueueAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateQueueStatusAsync.fulfilled, (state, action) => {
        const updatedTicket = action.payload?.data || action.payload;
        const index = state.tickets.findIndex(t => t.id === updatedTicket.id);
        if (index !== -1) state.tickets[index] = updatedTicket;
      })
      .addCase(fetchQueueStatusAsync.fulfilled, (state, action) => {
        const statusData = action.payload?.data || action.payload;
        state.currentStatus = {
          queuesAhead: statusData.queuesAhead || 0,
          estimatedWaitTime: statusData.estimatedWaitTime || 0,
          status: statusData.status || "Waiting"
        };
      });
  }
});

export const { addQueue, updateQueueStatus, deleteQueue } = queueSlice.actions;
export default queueSlice.reducer;