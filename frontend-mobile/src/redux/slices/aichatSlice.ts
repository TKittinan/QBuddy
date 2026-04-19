import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config";

export const fetchAiHistoryAsync = createAsyncThunk(
  "aichat/fetchHistory",
  async (userId: string, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const token = state.auth?.token;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // แนบ config เข้าไปด้วยค่ะ
      const response = await axios.get(`${API_BASE_URL}/ai-chat/${userId}`, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to load AI history");
    }
  }
);

// เพิ่ม getState เข้ามาในพารามิเตอร์ตัวที่สองค่ะ
export const sendAiMessageAsync = createAsyncThunk(
  "aichat/sendMessage",
  async (message: string, { getState, rejectWithValue }) => {
    try {
      // ดึงข้อมูล state ทั้งหมดออกมาเพื่อหา Token
      const state: any = getState();
      const token = state.auth?.token; 

      // สร้าง config เพื่อแนบ Token ไปกับ Headers
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.post(`${API_BASE_URL}/ai-chat`, { message }, config);
      return response.data; 
    } catch (error: any) {

      console.error("AI Error:", error.response?.data);
      return rejectWithValue(error.response?.data?.message || "AI failed to respond");
    }
  }
);

const aichatSlice = createSlice({
  name: "aichat",
  initialState: { messages: [] as any[], isLoading: false },
  reducers: {
    addMessage: (state, action) => { 
      state.messages.push(action.payload); 
    },
    clearMessages: (state) => { 
      state.messages = []; 
    }
  },
  extraReducers: (builder) => {
    builder
      // จัดการส่วนประวัติการแชท
      .addCase(fetchAiHistoryAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAiHistoryAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchAiHistoryAsync.rejected, (state) => {
        state.isLoading = false;
      })
      // จัดการส่วนส่งข้อความหา AI
      .addCase(sendAiMessageAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendAiMessageAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        // นำข้อความที่ Backend ตอบกลับมา สร้างเป็นข้อความฝั่ง AI ลงในแชท
        state.messages.push({
          id: Date.now().toString(),
          type: 'ai',
          // รองรับ key หลายแบบเผื่อ Backend ของต้าส่งชื่อ key ไม่เหมือนกันนะคะ
          text: action.payload.message || action.payload.reply || action.payload.text || 'รับทราบค่ะ',
          placeCard: action.payload.placeCard || undefined
        });
      })
      .addCase(sendAiMessageAsync.rejected, (state, action) => {
        state.isLoading = false;
        // ถ้า API มีปัญหา จะแสดงข้อความแจ้งเตือนสีเทาๆ ฝั่ง AI แทนค่ะ
        state.messages.push({
          id: Date.now().toString(),
          type: 'ai',
          text: (action.payload as string) || 'ขออภัยค่ะ ระบบ AI ขัดข้องชั่วคราว ลองใหม่อีกครั้งนะคะ'
        });
      });
  }
});

export const { addMessage, clearMessages } = aichatSlice.actions;
export default aichatSlice.reducer;