import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://192.168.1.X:5000/api/chat";

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
      const response = await axios.get(`${API_URL}/${activityId}`);
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
      const response = await axios.post(API_URL, messageData);
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
        state.messages = action.payload;
      })
      .addCase(sendChatMessageAsync.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  }
});

export const { addChatMessage } = chatSlice.actions;
export default chatSlice.reducer;