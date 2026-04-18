import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config";

export const fetchAiHistoryAsync = createAsyncThunk(
  "aichat/fetchHistory",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai-chat/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to load AI history");
    }
  }
);

const aichatSlice = createSlice({
  name: "aichat",
  initialState: { messages: [] as any[], isLoading: false },
  reducers: {
    addMessage: (state, action) => { state.messages.push(action.payload); },
    clearMessages: (state) => { state.messages = []; }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAiHistoryAsync.fulfilled, (state, action) => {
      state.messages = action.payload;
    });
  }
});

export const { addMessage, clearMessages } = aichatSlice.actions;
export default aichatSlice.reducer;