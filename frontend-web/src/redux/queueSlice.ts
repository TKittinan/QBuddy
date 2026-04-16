import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Ticket, TicketStatus } from "../types";

const initialState: { tickets: Ticket[] } = {
  tickets: [] // 🌟 เริ่มต้นด้วยค่าว่าง รอรับจาก API
};

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
    updateQueueStatus: (state, action: PayloadAction<{ id: string; status: TicketStatus }>) => {
      const ticket = state.tickets.find(t => t.id === action.payload.id);
      if (ticket) {
        ticket.status = action.payload.status;
      }
    },
    deleteQueue: (state, action: PayloadAction<string>) => {
      state.tickets = state.tickets.filter(t => t.id !== action.payload);
    }
  }
});

export const { setQueues, addQueue, updateQueueStatus, deleteQueue } = queueSlice.actions;
export default queueSlice.reducer;