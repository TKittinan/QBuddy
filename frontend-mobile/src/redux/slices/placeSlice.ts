import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Place } from '../../types';

const API_URL = "http://192.168.1.X:5000/api/places";

interface PlaceState {
  places: Place[];
  // 🌟 [เพิ่มใหม่] ตัวแปรเก็บรายชื่อร้านที่ AI คัดกรองมาให้
  recommendedPlaces: Place[]; 
  isLoading: boolean;
  error: string | null;
}

const initialState: PlaceState = {
  places: [],
  recommendedPlaces: [], // 🌟 [เพิ่มใหม่]
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

// 🌟 [เพิ่มใหม่] Thunk สำหรับยิงไปขอร้านที่ AI คำนวณมาให้
export const fetchRecommendedPlacesAsync = createAsyncThunk(
  "places/fetchRecommended",
  async (userName: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/recommend?user_name=${userName}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch recommendations");
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
      })
      // 🌟 [เพิ่มใหม่] จัดการ State ตอนดึงร้านแนะนำสำเร็จ
      .addCase(fetchRecommendedPlacesAsync.fulfilled, (state, action) => {
        state.recommendedPlaces = action.payload;
      });
  }
});

export const { setPlaces } = placeSlice.actions;
export default placeSlice.reducer;