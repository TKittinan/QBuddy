import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Ticket } from "../../types";

const initialState: { myTickets: Ticket[]; allTickets: Ticket[] } = {
  myTickets: [],
  allTickets: [],
};

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    bookTicket: (state, action: PayloadAction<Ticket>) => {
      state.myTickets.push(action.payload);
      state.allTickets.push(action.payload);
    },
    // 🌟 เพิ่ม Action นี้เข้าไปเพื่ออัปเดตสถานะ เช่น ยกเลิกคิว (Cancelled)
    updateQueueStatus: (state, action: PayloadAction<{ id: string; status: Ticket['status'] }>) => {
      const { id, status } = action.payload;
      
      const myTicket = state.myTickets.find(t => t.id === id);
      if (myTicket) myTicket.status = status;
      
      const allTicket = state.allTickets.find(t => t.id === id);
      if (allTicket) allTicket.status = status;
    }
  },
});

export const { bookTicket, updateQueueStatus } = queueSlice.actions;
export default queueSlice.reducer;