import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Place } from '../../types';

const API_URL = "http://192.168.1.X:5000/api/places";

interface PlaceState {
  places: Place[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PlaceState = {
  places: [],
  isLoading: false,
  error: null,
};

export const fetchPlacesAsync = createAsyncThunk(
  "places/fetchPlaces",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch places");
    }
  }
);

const placeSlice = createSlice({
  name: 'places',
  initialState,
  reducers: {
    setPlaces: (state, action: PayloadAction<Place[]>) => {
      state.places = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlacesAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPlacesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.places = action.payload;
      })
      .addCase(fetchPlacesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setPlaces } = placeSlice.actions;
export default placeSlice.reducer;