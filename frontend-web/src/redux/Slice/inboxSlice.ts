import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import type { SupportTicket } from "../../types";

// 1. AsyncThunk สำหรับดึง Ticket ทั้งหมดของ Admin
export const fetchInboxTickets = createAsyncThunk("inbox/fetchAll", async (_, { rejectWithValue }) => {
  try {
    // สมมติว่า Backend ผูก route ไว้ที่ /api/support
    const response = await axios.get(`${API_BASE_URL}/support/tickets`);
    // คืนค่าเป็น Array ของ Tickets (รองรับกรณี Backend ห่อด้วย { data: ... })
    return response.data?.data || response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch tickets");
  }
});

// 2. AsyncThunk สำหรับส่งคำตอบ (Reply) จาก Admin
export const sendReplyAsync = createAsyncThunk(
  "inbox/sendReply",
  async ({ ticketId, message }: { ticketId: string; message: string }, { rejectWithValue }) => {
    try {
      // ปรับชื่อตัวแปรให้ตรงกับฝั่ง Backend ที่ต้องการ (ticket_id, sender_id, text)
      const payload = {
        ticket_id: ticketId,
        sender_id: "admin",
        text: message
      };
      
      const response = await axios.post(`${API_BASE_URL}/support/messages`, payload);
      return { ticketId, message: response.data }; 
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
      await axios.put(`${API_BASE_URL}/support/tickets/${ticketId}/status`, { status: "Resolved" });
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
          // ถ้าไม่มี array messages ให้สร้างใหม่
          if (!ticket.messages) ticket.messages = [];
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