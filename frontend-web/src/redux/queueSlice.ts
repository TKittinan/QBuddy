import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Ticket, TicketStatus } from "../types";

const initialState: { tickets: Ticket[] } = {
  tickets: JSON.parse(localStorage.getItem("live_queue_tickets") || "[]") as Ticket[]
};

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    // 🌟 เพิ่ม setQueues สำหรับรับข้อมูลเริ่มต้นจาก DB
    setQueues: (state, action: PayloadAction<Ticket[]>) => {
      state.tickets = action.payload;
      localStorage.setItem("live_queue_tickets", JSON.stringify(state.tickets));
    },
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
    },
    deleteQueue: (state, action: PayloadAction<string>) => {
      state.tickets = state.tickets.filter(t => t.id !== action.payload);
      localStorage.setItem("live_queue_tickets", JSON.stringify(state.tickets));
    }
  }
});

export const { setQueues, addQueue, updateQueueStatus, deleteQueue } = queueSlice.actions;
export default queueSlice.reducer;