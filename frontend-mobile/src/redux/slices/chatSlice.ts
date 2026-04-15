import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ChatMessage {
  id: number;
  sender: 'me' | 'friend';
  text: string;
}

interface ChatState {
  messages: ChatMessage[];
}

const initialState: ChatState = {
  messages: [
    { id: 1, sender: 'friend', text: 'สวัสดีครับ ขอเข้าตี้ด้วยคนครับ!' }
  ]
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    }
  }
});

export const { addChatMessage } = chatSlice.actions;
export default chatSlice.reducer;