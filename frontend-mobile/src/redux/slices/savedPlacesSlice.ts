import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = "http://192.168.1.X:5000/api/saved-places";

interface SavedPlacesState {
  savedByUser: Record<string, string[]>;
  isLoading: boolean;
}

const initialState: SavedPlacesState = {
  savedByUser: {},
  isLoading: false,
};

// ดึงรายการที่เซฟจาก Database เพื่อซิงค์ข้ามเครื่อง
export const fetchSavedPlacesAsync = createAsyncThunk(
  "savedPlaces/fetch",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      return { userId, places: response.data }; // คาดหวัง API คืนค่าเป็น Array ของ ID
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to sync saved places");
    }
  }
);

// แจ้ง Backend เมื่อมีการเพิ่มหรือลบร้านโปรด
export const toggleSavePlaceAsync = createAsyncThunk(
  "savedPlaces/toggle",
  async ({ userId, placeId }: { userId: string; placeId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, { userId, placeId });
      return { userId, placeId, action: response.data.action }; // action: 'added' | 'removed'
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update saved place");
    }
  }
);

const savedPlacesSlice = createSlice({
  name: 'savedPlaces',
  initialState,
  reducers: {
    toggleSavePlace: (state, action: PayloadAction<{ username: string; placeId: string }>) => {
      const { username, placeId } = action.payload;
      if (!state.savedByUser[username]) state.savedByUser[username] = [];
      const userSaved = state.savedByUser[username];
      const index = userSaved.indexOf(placeId);
      if (index >= 0) userSaved.splice(index, 1);
      else userSaved.push(placeId);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedPlacesAsync.fulfilled, (state, action) => {
        state.savedByUser[action.payload.userId] = action.payload.places;
      })
      .addCase(toggleSavePlaceAsync.fulfilled, (state, action) => {
        const { userId, placeId, action: serverAction } = action.payload;
        if (!state.savedByUser[userId]) state.savedByUser[userId] = [];
        if (serverAction === 'added') {
          if (!state.savedByUser[userId].includes(placeId)) state.savedByUser[userId].push(placeId);
        } else {
          state.savedByUser[userId] = state.savedByUser[userId].filter(id => id !== placeId);
        }
      });
  }
});

export const { toggleSavePlace } = savedPlacesSlice.actions;
export default savedPlacesSlice.reducer;