import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
// 🌟 1. นำเข้า API_BASE_URL จาก config กลาง
import { API_BASE_URL } from "../../config";

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
      // 🌟 2. ใช้ API_BASE_URL แทน URL ที่ Hardcode ไว้
      const response = await axios.get(`${API_BASE_URL}/saved-places/${userId}`);
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
      // 🌟 3. ใช้ API_BASE_URL
      const response = await axios.post(`${API_BASE_URL}/saved-places`, { userId, placeId });
      const data = response.data?.data || response.data;
      return { userId, placeId, action: data.action }; // 'added' | 'removed'
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
        // 🌟 4. ดักจับข้อมูลเผื่อ API หุ้มก้อน .data มาให้ เพื่อป้องกันแอปจอขาว
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

export const { toggleSavePlace } = savedPlacesSlice.actions;
export default savedPlacesSlice.reducer;