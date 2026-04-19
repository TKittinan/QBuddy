import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config";

export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetch",
  async (range: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/stats?range=${range}`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to load dashboard data");
    }
  }
);

interface DashboardState {
  stats: { totalVisitors: number; activeQueues: number; completed: number };
  activities: any[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: { totalVisitors: 0, activeQueues: 0, completed: 0 },
  activities: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.activities = action.payload.activities;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;