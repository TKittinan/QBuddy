import { createSlice, PayloadAction } from "@reduxjs/toolkit";
const MOCK_TICKETS = [
  { id: 'ATRC3-CTM1', name: 'Taggsh', service: 'ร้านอาหาร', shopId: '1', status: 'Waiting', createdAt: new Date().toISOString() },
  { id: 'SBNR1-CTM5', name: 'Taggsh', service: 'ร้านอาหาร', shopId: '2', status: 'Serving', createdAt: new Date().toISOString() },
  { id: 'VCC2-CTM10', name: 'Taggsh', service: 'คาเฟ่', shopId: '3', status: 'Completed', createdAt: new Date(Date.now() - 86400000).toISOString() }, 
  { id: 'ATRC3-CTM0', name: 'Taggsh', service: 'คาเฟ่', shopId: '1', status: 'Cancelled', createdAt: new Date(Date.now() - 172800000).toISOString() } 
];

const initialState = {
  allTickets: MOCK_TICKETS,
};

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    // เพิ่มคิวใหม่เข้าระบบ
    bookTicket: (state, action: PayloadAction<any>) => { 
      state.allTickets.push(action.payload); 
    },
    
    // อัปเดตสถานะคิว (ใช้ตอนกดยกเลิกคิว)
    updateQueueStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const ticket = state.allTickets.find((t: any) => t.id === action.payload.id);
      if (ticket) {
        ticket.status = action.payload.status;
      }
    }
  },
});

export const { bookTicket, updateQueueStatus } = queueSlice.actions;
export default queueSlice.reducer;