import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 🌟 สร้าง Interface เพื่อบอก TypeScript ว่า Guest หน้าตาเป็นยังไง
export interface Guest {
  userId: string;
  userName: string;
  pax: number;
  status: 'pending' | 'confirmed';
}

// 🌟 สร้าง Interface สำหรับ Activity เพื่อป้องกัน Error never[]
export interface Activity {
  id: string;
  hostId: string;
  name: string;
  activity: string;
  category: string;
  avatar: string;
  lat: number;
  lng: number;
  successRate: number;
  sharedInterests: number;
  linkedTicket: {
    shopId: string;
    shopName: string;
    bookTime: string;
    bookDate: string;
    tableType: string;
    tableCapacity: number;
    hostPax: number;
  };
  joinedGuests: Guest[]; // 🌟 ระบุชัดเจนว่าเป็นอาร์เรย์ของ Guest
  status: 'open' | 'closed';
}

// 🌟 ใส่ Type Activity[] เข้าไปที่ MOCK_USERS
const MOCK_USERS: Activity[] = [
  {
    id: 'act_1',
    hostId: 'u1',
    name: 'กฤษฎา',
    activity: 'อยากหาเพื่อนไปกิน Copper วันนี้ครับ',
    category: 'ร้านอาหาร',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    lat: 13.7760,
    lng: 100.4750,
    successRate: 92,
    sharedInterests: 2,
    linkedTicket: { 
      shopId: '1', 
      shopName: 'Copper Beyond Buffet (The Sense Pinklao)',
      bookTime: '12:00', 
      bookDate: new Date().toISOString(),
      tableType: 't3',
      tableCapacity: 8,
      hostPax: 4
    },
    joinedGuests: [], // ตอนนี้ TypeScript จะรู้แล้วว่านี่คือ Guest[] ที่ว่างเปล่า
    status: 'open'
  }
];

const initialState = {
  allActivities: MOCK_USERS,
  joinedActivities: [] as string[],
};

const friendSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    addActivity: (state, action: PayloadAction<Activity>) => {
      state.allActivities.unshift(action.payload);
    },
    joinActivity: (state, action: PayloadAction<{activityId: string, guest: Omit<Guest, 'status'>}>) => {
      const act = state.allActivities.find(a => a.id === action.payload.activityId);
      if (act) {
        act.joinedGuests.push({ ...action.payload.guest, status: 'pending' });
      }
      if (!state.joinedActivities.includes(action.payload.activityId)) {
        state.joinedActivities.push(action.payload.activityId);
      }
    },
    confirmGuest: (state, action: PayloadAction<{activityId: string, userId: string}>) => {
      const act = state.allActivities.find(a => a.id === action.payload.activityId);
      if (act) {
        const guest = act.joinedGuests.find(g => g.userId === action.payload.userId);
        if (guest) guest.status = 'confirmed';
      }
    },
    removeGuest: (state, action: PayloadAction<{activityId: string, userId: string}>) => {
      const act = state.allActivities.find(a => a.id === action.payload.activityId);
      if (act) {
        act.joinedGuests = act.joinedGuests.filter(g => g.userId !== action.payload.userId);
      }
      state.joinedActivities = state.joinedActivities.filter(id => id !== action.payload.activityId);
    },
    closeActivity: (state, action: PayloadAction<string>) => {
      const act = state.allActivities.find(a => a.id === action.payload);
      if (act) act.status = 'closed';
    }
  },
});

export const { addActivity, joinActivity, confirmGuest, removeGuest, closeActivity } = friendSlice.actions;
export default friendSlice.reducer;