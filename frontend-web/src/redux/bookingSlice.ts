import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Ticket, TicketStatus } from "../types";

// 🌟 เปลี่ยนมารับ Data แบบ Ticket 100% เหมือนฝั่ง Mobile
const initialState: { bookings: Ticket[] } = {
  bookings: JSON.parse(localStorage.getItem("booking_db") || "[]")
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    addBooking: (state, action: PayloadAction<Ticket>) => {
      state.bookings.push(action.payload);
      localStorage.setItem("booking_db", JSON.stringify(state.bookings));
    },
    updateBookingStatus: (state, action: PayloadAction<{ id: string; status: TicketStatus }>) => {
      const booking = state.bookings.find(b => b.id === action.payload.id);
      if (booking) {
        booking.status = action.payload.status;
        localStorage.setItem("booking_db", JSON.stringify(state.bookings));
      }
    },
    updateBookingDetails: (state, action: PayloadAction<Partial<Ticket> & { id: string }>) => {
      const index = state.bookings.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = { ...state.bookings[index], ...action.payload };
        localStorage.setItem("booking_db", JSON.stringify(state.bookings));
      }
    },
    deleteBooking: (state, action: PayloadAction<string>) => {
      state.bookings = state.bookings.filter(b => b.id !== action.payload);
      localStorage.setItem("booking_db", JSON.stringify(state.bookings));
    }
  }
});

export const { addBooking, updateBookingStatus, updateBookingDetails, deleteBooking } = bookingSlice.actions;
export default bookingSlice.reducer;