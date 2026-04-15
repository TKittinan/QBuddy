import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// =========================================================================
// 🗄️ [SUPABASE DB CONNECTION MOCKUP] - ตาราง Tickets
// =========================================================================
/*
  การเพิ่มคิวใหม่:
  const addTicketToDB = async (ticketData) => {
    const { data, error } = await supabase.from('tickets').insert([ticketData]);
    if(data) dispatch(bookTicket(data[0]));
  }
*/
// =========================================================================

const MOCK_TICKETS = [
  { id: 'CBB-R-001', name: 'Taggsh', service: 'ร้านอาหาร', shopId: '1', status: 'Waiting', createdAt: new Date().toISOString(), guests: 2, tableType: 't1' },
  { id: 'SP-R-015', name: 'Taggsh', service: 'ร้านอาหาร', shopId: '2', status: 'Serving', createdAt: new Date().toISOString(), guests: 4, tableType: 't2' },
  { id: 'AYD-C-102', name: 'Taggsh', service: 'คาเฟ่', shopId: '3', status: 'Completed', createdAt: new Date(Date.now() - 86400000).toISOString(), guests: 2, tableType: 't2' }, 
  { id: 'VSS-B-044', name: 'Taggsh', service: 'เสริมสวยอื่นๆ', shopId: '4', status: 'Cancelled', createdAt: new Date(Date.now() - 172800000).toISOString(), guests: 1 } 
];

const initialState = {
  allTickets: MOCK_TICKETS,
};

const queueSlice = createSlice({
  name: "queue",
  initialState,
  reducers: {
    bookTicket: (state, action: PayloadAction<any>) => { 
      state.allTickets.push(action.payload); 
    },
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