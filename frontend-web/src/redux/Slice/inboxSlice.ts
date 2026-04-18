import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import type { SupportTicket, Message } from "../../types";

// 1. AsyncThunk สำหรับดึง Ticket ทั้งหมด
export const fetchInboxTickets = createAsyncThunk("inbox/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/support-tickets`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch tickets");
  }
});

// 2. AsyncThunk สำหรับส่งคำตอบ (Reply)
export const sendReplyAsync = createAsyncThunk(
  "inbox/sendReply",
  async ({ ticketId, message }: { ticketId: string; message: Message }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/support-tickets/${ticketId}/reply`, { message });
      return { ticketId, message: response.data }; // คาดหวังว่า Backend จะคืน Message ที่สมบูรณ์กลับมา
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to send reply");
    }
  }
);

// 3. AsyncThunk สำหรับปิดเคส (Resolve)
export const resolveTicketAsync = createAsyncThunk(
  "inbox/resolve",
  async (ticketId: string, { rejectWithValue }) => {
    try {
      await axios.patch(`${API_BASE_URL}/support-tickets/${ticketId}/resolve`, { status: "Resolved" });
      return ticketId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to resolve ticket");
    }
  }
);

interface InboxState {
  tickets: SupportTicket[];
  loading: boolean;
  error: string | null;
}

const initialState: InboxState = {
  tickets: [],
  loading: false,
  error: null,
};

const inboxSlice = createSlice({
  name: "inbox",
  initialState,
  reducers: {
    // เคลียร์ Error ในหน้า UI
    clearInboxError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tickets
      .addCase(fetchInboxTickets.pending, (state) => { state.loading = true; })
      .addCase(fetchInboxTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchInboxTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Send Reply
      .addCase(sendReplyAsync.fulfilled, (state, action) => {
        const ticket = state.tickets.find(t => t.id === action.payload.ticketId);
        if (ticket) {
          ticket.messages.push(action.payload.message);
        }
      })
      // Resolve Ticket
      .addCase(resolveTicketAsync.fulfilled, (state, action) => {
        const ticket = state.tickets.find(t => t.id === action.payload);
        if (ticket) {
          ticket.status = "Resolved";
        }
      });
  },
});

export const { clearInboxError } = inboxSlice.actions;
export default inboxSlice.reducer;