import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Place } from "../types";

const initialState: { places: Place[] } = {
  places: JSON.parse(localStorage.getItem("local_shops_db") || "[]")
};

const placeSlice = createSlice({
  name: "places",
  initialState,
  reducers: {
    addPlace: (state, action: PayloadAction<Place>) => {
      state.places.push(action.payload);
      localStorage.setItem("local_shops_db", JSON.stringify(state.places));
    },
    updatePlace: (state, action: PayloadAction<Place>) => {
      const index = state.places.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.places[index] = action.payload;
        localStorage.setItem("local_shops_db", JSON.stringify(state.places));
      }
    },
    deletePlace: (state, action: PayloadAction<string>) => {
      state.places = state.places.filter(p => p.id !== action.payload);
      localStorage.setItem("local_shops_db", JSON.stringify(state.places));
    }
  }
});

export const { addPlace, updatePlace, deletePlace } = placeSlice.actions;
export default placeSlice.reducer;