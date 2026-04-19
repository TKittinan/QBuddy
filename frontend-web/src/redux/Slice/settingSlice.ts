import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import type { SettingsState } from "../../types";

//  1. AsyncThunk สำหรับดึงข้อมูลการตั้งค่าจาก Server
export const fetchSettings = createAsyncThunk("settings/fetch", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/settings`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch settings");
  }
});

//  2. AsyncThunk สำหรับอัปเดตการตั้งค่า (Save Settings)
export const updateSettingsAsync = createAsyncThunk(
  "settings/update",
  async (newSettings: Partial<SettingsState>, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/settings`, newSettings);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update settings");
    }
  }
);

interface ExtendedSettingsState extends SettingsState {
  loading: boolean;
  error: string | null;
}

const initialState: ExtendedSettingsState = {
  businessName: "",
  phone: "",
  email: "",
  loading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        // กระจายค่าที่ได้จาก API ลงไปใน state ทั้งหมด
        Object.assign(state, action.payload);
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Settings
      .addCase(updateSettingsAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSettingsAsync.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(updateSettingsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default settingsSlice.reducer;