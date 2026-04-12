import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type TicketStatus = "Waiting" | "Serving" | "Completed" | "Skipped" | "Cancelled";

export type Ticket = {
  id: string;
  name: string;
  service: string;
  shopId: string;
  waitTime: number;
  status: TicketStatus;
  createdAt: string;
};

const initialState: { tickets: Ticket[] } = {
  tickets: JSON.parse(localStorage.getItem("live_queue_tickets") || "[]")
};

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    addQueue: (state, action: PayloadAction<Ticket>) => {
      state.tickets.push(action.payload);
      localStorage.setItem("live_queue_tickets", JSON.stringify(state.tickets));
    },
    updateQueueStatus: (state, action: PayloadAction<{ id: string; status: TicketStatus }>) => {
      const ticket = state.tickets.find(t => t.id === action.payload.id);
      if (ticket) {
        ticket.status = action.payload.status;
        localStorage.setItem("live_queue_tickets", JSON.stringify(state.tickets));
      }
    }
  }
});

export const { addQueue, updateQueueStatus } = queueSlice.actions;
export default queueSlice.reducer;