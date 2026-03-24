import { Router } from "express";

import {
  createBooking,
  getBookings,
  getBookingByUser,
  cancelBooking,
} from "../controllers/booking_controller";

const router = Router();

// create booking
router.post("/", createBooking);

// get all
router.get("/", getBookings);

// get by user
router.get("/user/:user_id", getBookingByUser);

// cancel
router.put("/cancel/:id", cancelBooking);

export default router;