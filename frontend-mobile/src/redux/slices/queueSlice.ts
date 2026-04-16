import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { Ticket } from "../../types";

const API_URL = "http://192.168.1.X:5000/api/queues";

interface QueueState {
  tickets: Ticket[];
  isLoading: boolean;
  error: string | null;
}

const initialState: QueueState = {
  tickets: [],
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
      const response = await axios.patch(`${API_URL}/${id}`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Update error");
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
      });
  }
});

export const { setQueues, addQueue, updateQueueStatus, deleteQueue } = queueSlice.actions;
export default queueSlice.reducer;