import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SupportTicket, Message } from "../types";

interface InboxState {
  tickets: SupportTicket[];
}

const initialState: InboxState = {
  tickets: [],
};

const inboxSlice = createSlice({
  name: "inbox",
  initialState,
  reducers: {
    setInboxTickets: (state, action: PayloadAction<SupportTicket[]>) => {
      state.tickets = action.payload;
    },
    addReply: (state, action: PayloadAction<{ ticketId: string; message: Message }>) => {
      const ticket = state.tickets.find(t => t.id === action.payload.ticketId);
      if (ticket) {
        ticket.messages.push(action.payload.message);
      }
    },
    resolveTicket: (state, action: PayloadAction<string>) => {
      const ticket = state.tickets.find(t => t.id === action.payload);
      if (ticket) {
        ticket.status = "Resolved";
      }
    }
  }
});

export const { setInboxTickets, addReply, resolveTicket } = inboxSlice.actions;
export default inboxSlice.reducer;