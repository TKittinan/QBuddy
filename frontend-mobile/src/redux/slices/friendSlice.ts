import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface JoinedGuest {
  userId: string;
  userName: string;
  pax: number;
}

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
  joinedGuests: JoinedGuest[];
  status: 'open' | 'closed';
}

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
      shopName: 'Copper Beyond Buffet',
      bookTime: '12:00', 
      bookDate: new Date().toISOString(),
      tableType: 't2',
      tableCapacity: 4,
      hostPax: 2
    },
    joinedGuests: [],
    status: 'open'
  },
  {
    id: 'act_2',
    hostId: 'u2',
    name: 'พรพิชัย',
    activity: 'ไปตี้ชาบูกัน ขาดอีก 1 คน',
    category: 'ร้านอาหาร',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    lat: 13.7500,
    lng: 100.5300,
    successRate: 70,
    sharedInterests: 1,
    linkedTicket: { 
      shopId: '2', 
      shopName: 'Shabushi Premium',
      bookTime: '14:30', 
      bookDate: new Date().toISOString(),
      tableType: 't2',
      tableCapacity: 4,
      hostPax: 3
    },
    joinedGuests: [],
    status: 'open'
  }
];

const initialState = {
  allActivities: MOCK_USERS,
};

const friendSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    addActivity: (state, action: PayloadAction<Activity>) => {
      state.allActivities.unshift(action.payload);
    },
    joinActivity: (state, action: PayloadAction<{ activityId: string, guest: JoinedGuest }>) => {
      const act = state.allActivities.find(a => a.id === action.payload.activityId);
      if (act) {
        act.joinedGuests.push(action.payload.guest);
      }
    },
    closeActivity: (state, action: PayloadAction<string>) => {
      const act = state.allActivities.find(a => a.id === action.payload);
      if (act) {
        act.status = 'closed';
      }
    }
  },
});

export const { addActivity, joinActivity, closeActivity } = friendSlice.actions;
export default friendSlice.reducer;