import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Ticket, TicketStatus } from "../types";

const initialState: { bookings: Ticket[] } = {
  bookings: []
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setBookings: (state, action: PayloadAction<Ticket[]>) => {
      state.bookings = action.payload;
    },
    addBooking: (state, action: PayloadAction<Ticket>) => {
      state.bookings.push(action.payload);
    },
    updateBookingStatus: (state, action: PayloadAction<{ id: string; status: TicketStatus }>) => {
      const booking = state.bookings.find(b => b.id === action.payload.id);
      if (booking) {
        booking.status = action.payload.status;
      }
    },
    updateBookingDetails: (state, action: PayloadAction<Partial<Ticket> & { id: string }>) => {
      const index = state.bookings.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = { ...state.bookings[index], ...action.payload };
      }
    },
    deleteBooking: (state, action: PayloadAction<string>) => {
      state.bookings = state.bookings.filter(b => b.id !== action.payload);
    }
  }
});

export const { setBookings, addBooking, updateBookingStatus, updateBookingDetails, deleteBooking } = bookingSlice.actions;
export default bookingSlice.reducer;