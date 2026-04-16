import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Place } from "../types";

const initialState: { places: Place[] } = {
  places: []
};

const placeSlice = createSlice({
  name: "places",
  initialState,
  reducers: {
    setPlaces: (state, action: PayloadAction<Place[]>) => {
      state.places = action.payload;
    },
    addPlace: (state, action: PayloadAction<Place>) => {
      state.places.push(action.payload);
    },
    updatePlace: (state, action: PayloadAction<Place>) => {
      const index = state.places.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.places[index] = action.payload;
      }
    },
    deletePlace: (state, action: PayloadAction<string>) => {
      state.places = state.places.filter(p => p.id !== action.payload);
    }
  }
});

export const { setPlaces, addPlace, updatePlace, deletePlace } = placeSlice.actions;
export default placeSlice.reducer;