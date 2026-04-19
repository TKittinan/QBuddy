import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Place } from '../../types';
import { API_BASE_URL } from "../../config";

interface PlaceState {
  places: Place[];
  recommendedPlaces: Place[]; 
  weeklyTrending: Place[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PlaceState = {
  places: [],
  recommendedPlaces: [], 
  weeklyTrending: [],
  isLoading: false,
  error: null,
};

export const fetchPlacesAsync = createAsyncThunk(
  "places/fetchPlaces",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/places`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch places");
    }
  }
);

export const fetchRecommendedPlacesAsync = createAsyncThunk(
  "places/fetchRecommended",
  async (userName: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/places/recommend?user_name=${userName}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch recommendations");
    }
  }
);

export const fetchWeeklyTrendingAsync = createAsyncThunk(
  "places/fetchWeeklyTrending",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/places/trending/weekly`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch trending");
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
      .addCase(fetchPlacesAsync.pending, (state) => { state.isLoading = true; })
      .addCase(fetchPlacesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.places = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      })
      .addCase(fetchPlacesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRecommendedPlacesAsync.pending, (state) => { state.isLoading = true; })
      .addCase(fetchRecommendedPlacesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommendedPlaces = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      })
      .addCase(fetchRecommendedPlacesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchWeeklyTrendingAsync.pending, (state) => { state.isLoading = true; })
      .addCase(fetchWeeklyTrendingAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.weeklyTrending = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchWeeklyTrendingAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPlaces } = placeSlice.actions;
export default placeSlice.reducer;