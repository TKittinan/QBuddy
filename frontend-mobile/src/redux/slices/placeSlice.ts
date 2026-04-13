import { createSlice } from "@reduxjs/toolkit";
import type { Place } from "../../types";

const initialState: { places: Place[] } = {
  places: [
    { id: "p1", placeId: "SHP-001", name: "Seoul Chon", categories: ["ร้านอาหาร"], status: "Active", avgServiceTime: 15 },
    { id: "p2", placeId: "SHP-002", name: "Nude Steak", categories: ["ร้านอาหาร"], status: "Active", avgServiceTime: 20 },
    { id: "p3", placeId: "SHP-003", name: "Fast Cafe", categories: ["คาเฟ่"], status: "Active", avgServiceTime: 5 },
  ],
};

const placeSlice = createSlice({
  name: "places",
  initialState,
  reducers: {},
});

export default placeSlice.reducer;