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
  },
});

export const { bookTicket } = queueSlice.actions;
export default queueSlice.reducer;