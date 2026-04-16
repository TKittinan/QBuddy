import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SupportTicket, Message } from "../types"; // 🌟 ดึง Type มาจากศูนย์กลาง

interface InboxState {
  tickets: SupportTicket[];
}

const initialState: InboxState = {
  tickets: JSON.parse(localStorage.getItem("support_tickets") || "[]") as SupportTicket[],
};

const inboxSlice = createSlice({
  name: "inbox",
  initialState,
  reducers: {
    setInboxTickets: (state, action: PayloadAction<SupportTicket[]>) => {
      state.tickets = action.payload;
      localStorage.setItem("support_tickets", JSON.stringify(state.tickets));
    },
    addReply: (state, action: PayloadAction<{ ticketId: string; message: Message }>) => {
      const ticket = state.tickets.find(t => t.id === action.payload.ticketId);
      if (ticket) {
        ticket.messages.push(action.payload.message);
        localStorage.setItem("support_tickets", JSON.stringify(state.tickets));
      }
    },
    resolveTicket: (state, action: PayloadAction<string>) => {
      const ticket = state.tickets.find(t => t.id === action.payload);
      if (ticket) {
        ticket.status = "Resolved";
        localStorage.setItem("support_tickets", JSON.stringify(state.tickets));
      }
    }
  }
});

export const { setInboxTickets, addReply, resolveTicket } = inboxSlice.actions;
export default inboxSlice.reducer;