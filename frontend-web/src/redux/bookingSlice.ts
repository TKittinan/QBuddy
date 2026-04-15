import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type BookingStatus = "Waiting" | "Completed" | "Cancelled";

export type Booking = {
  id: string;
  bookingId: string;
  user: { name: string; email: string };
  placeId: string;
  placeName: string;
  queueNo: string;
  dateTime: string;
  status: BookingStatus;
  createdAt: string;
};

const initialState: { bookings: Booking[] } = {
  bookings: JSON.parse(localStorage.getItem("booking_db") || "[]")
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings.push(action.payload);
      localStorage.setItem("booking_db", JSON.stringify(state.bookings));
    },
    updateBookingStatus: (state, action: PayloadAction<{ id: string; status: BookingStatus }>) => {
      const booking = state.bookings.find(b => b.id === action.payload.id);
      if (booking) {
        booking.status = action.payload.status;
        localStorage.setItem("booking_db", JSON.stringify(state.bookings));
      }
    },
    updateBookingDetails: (state, action: PayloadAction<{ id: string; user: { name: string; email: string }; dateTime: string; placeId?: string; placeName?: string; queueNo?: string; bookingId?: string }>) => {
      const booking = state.bookings.find(b => b.id === action.payload.id);
      if (booking) {
        booking.user = action.payload.user;
        booking.dateTime = action.payload.dateTime;
        if (action.payload.placeId) booking.placeId = action.payload.placeId;
        if (action.payload.placeName) booking.placeName = action.payload.placeName;
        if (action.payload.queueNo) booking.queueNo = action.payload.queueNo;
        if (action.payload.bookingId) booking.bookingId = action.payload.bookingId;
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