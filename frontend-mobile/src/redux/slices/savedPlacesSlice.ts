import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from "../../config";

interface SavedPlacesState {
  savedByUser: Record<string, string[]>;
  isLoading: boolean;
}

const initialState: SavedPlacesState = {
  savedByUser: {},
  isLoading: false,
};

export const fetchSavedPlacesAsync = createAsyncThunk(
  "savedPlaces/fetch",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/saved-places/${userId}`);
      return { userId, places: response.data }; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to sync saved places");
    }
  }
);

export const toggleSavePlaceAsync = createAsyncThunk(
  "savedPlaces/toggle",
  async ({ userId, placeId }: { userId: string; placeId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/saved-places`, { userId, placeId });
      const data = response.data?.data || response.data;
      return { userId, placeId, action: data.action }; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update saved place");
    }
  }
);

const savedPlacesSlice = createSlice({
  name: 'savedPlaces',
  initialState,
  reducers: {
    toggleSavePlaceLocal: (state, action: PayloadAction<{ userId: string; placeId: string }>) => {
      const { userId, placeId } = action.payload;
      if (!state.savedByUser[userId]) state.savedByUser[userId] = [];
      const userSaved = state.savedByUser[userId];
      const index = userSaved.indexOf(placeId);
      
      if (index >= 0) userSaved.splice(index, 1);
      else userSaved.push(placeId);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedPlacesAsync.fulfilled, (state, action) => {
        const placesArray = Array.isArray(action.payload.places) 
          ? action.payload.places 
          : (action.payload.places?.data || []);
        state.savedByUser[action.payload.userId] = placesArray;
      })
      .addCase(toggleSavePlaceAsync.fulfilled, (state, action) => {
        const { userId, placeId, action: serverAction } = action.payload;
        if (!state.savedByUser[userId]) state.savedByUser[userId] = [];
        
        if (serverAction === 'added') {
          if (!state.savedByUser[userId].includes(placeId)) state.savedByUser[userId].push(placeId);
        } else if (serverAction === 'removed') {
          state.savedByUser[userId] = state.savedByUser[userId].filter(id => id !== placeId);
        }
      });
  },
});

export const { toggleSavePlaceLocal } = savedPlacesSlice.actions;
export default savedPlacesSlice.reducer;