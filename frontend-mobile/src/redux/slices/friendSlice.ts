import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = {
  nearbyUsers: [
    { id: '101', name: 'พรพิชัย', activity: 'อยากหาเพื่อนไปกินอาหาร', expireAt: Date.now() + 7200000, timeStr: 'วันนี้ 18:00 น.', lat: 13.7550, lng: 100.5050, avatar: 'https://i.pravatar.cc/150?u=1', category: 'ร้านอาหาร' },
    { id: '102', name: 'วิศรุต', activity: 'หาเพื่อนไปนั่งทำงานเงียบๆ', expireAt: Date.now() + 86400000, timeStr: 'พรุ่งนี้ 06:00 น.', lat: 13.7500, lng: 100.5200, avatar: 'https://i.pravatar.cc/150?u=2', category: 'คาเฟ่' },
  ],
  aiMatches: [
    { id: '1', name: 'กฤษฎา', match: 92, image: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400', category: 'ร้านอาหาร', lat: 13.7563, lng: 100.5018 },
    { id: '2', name: 'สุชาวดี', match: 88, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', category: 'คาเฟ่', lat: 13.7600, lng: 100.5100 },
  ],
  joinedActivities: [] as string[]
};

const friendSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    addActivity: (state, action) => { state.nearbyUsers.unshift(action.payload); },
    joinActivity: (state, action: PayloadAction<string>) => { state.joinedActivities.push(action.payload); }
  }
});
export const { addActivity, joinActivity } = friendSlice.actions;
export default friendSlice.reducer;