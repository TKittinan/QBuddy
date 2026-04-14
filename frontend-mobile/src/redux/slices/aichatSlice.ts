import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: { messages: [] as any[] },
  reducers: {
    addMessage: (state, action) => { state.messages.push(action.payload); },
    clearMessages: (state) => { state.messages = []; }
  }
});
export const { addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;