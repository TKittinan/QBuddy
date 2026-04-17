import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../config";
import type { Place } from "../types";

// 1. AsyncThunk สำหรับดึงสถานที่ทั้งหมด
export const fetchPlaces = createAsyncThunk("places/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/places`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch places");
  }
});

// 2. AsyncThunk สำหรับเพิ่มสถานที่ใหม่
export const addPlaceAsync = createAsyncThunk("places/add", async (newPlace: Omit<Place, 'id'>, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/places`, newPlace);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to add place");
  }
});

// 3. AsyncThunk สำหรับอัปเดตข้อมูลสถานที่
export const updatePlaceAsync = createAsyncThunk("places/update", async (place: Place, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/places/${place.id}`, place);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to update place");
  }
});

// 4. AsyncThunk สำหรับลบสถานที่
export const deletePlaceAsync = createAsyncThunk("places/delete", async (id: string, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_BASE_URL}/places/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete place");
  }
});

interface PlaceState {
  places: Place[];
  loading: boolean;
  error: string | null;
}

const initialState: PlaceState = {
  places: [],
  loading: false,
  error: null,
};

const placeSlice = createSlice({
  name: "places",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Places
      .addCase(fetchPlaces.pending, (state) => { state.loading = true; })
      .addCase(fetchPlaces.fulfilled, (state, action) => {
        state.loading = false;
        state.places = action.payload;
      })
      .addCase(fetchPlaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add Place
      .addCase(addPlaceAsync.fulfilled, (state, action) => {
        state.places.push(action.payload);
      })
      // Update Place
      .addCase(updatePlaceAsync.fulfilled, (state, action) => {
        const index = state.places.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.places[index] = action.payload;
        }
      })
      // Delete Place
      .addCase(deletePlaceAsync.fulfilled, (state, action) => {
        state.places = state.places.filter(p => p.id !== action.payload);
      });
  },
});

export default placeSlice.reducer;