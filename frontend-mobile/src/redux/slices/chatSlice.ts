import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config";

export interface ChatMessage {
  id: string;
  activityId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
};

export const fetchChatHistoryAsync = createAsyncThunk(
  "chat/fetchHistory",
  async (activityId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/${activityId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to load chat");
    }
  }
);

export const sendChatMessageAsync = createAsyncThunk(
  "chat/sendMessage",
  async (messageData: Partial<ChatMessage>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, messageData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to send message");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatHistoryAsync.fulfilled, (state, action) => {
        state.messages = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      })
      .addCase(sendChatMessageAsync.fulfilled, (state, action) => {
        const newMessage = action.payload?.data || action.payload;
        state.messages.push(newMessage);
      });
  }
});

export const { addChatMessage } = chatSlice.actions;
export default chatSlice.reducer;