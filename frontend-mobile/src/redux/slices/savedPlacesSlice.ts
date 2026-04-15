import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// โครงสร้าง State: แยกเก็บ ID ร้านที่เซฟตามชื่อ User
// เช่น { "Taggsh": ["1", "2"], "John": ["3"] }
interface SavedPlacesState {
  savedByUser: Record<string, string[]>;
}

const initialState: SavedPlacesState = {
  savedByUser: {},
};

const savedPlacesSlice = createSlice({
  name: 'savedPlaces',
  initialState,
  reducers: {
    toggleSavePlace: (state, action: PayloadAction<{ username: string; placeId: string }>) => {
      const { username, placeId } = action.payload;
      
      // ถ้า User นี้ยังไม่เคยเซฟอะไรเลย ให้สร้าง Array ว่างรอไว้
      if (!state.savedByUser[username]) {
        state.savedByUser[username] = [];
      }
      
      const userSaved = state.savedByUser[username];
      const index = userSaved.indexOf(placeId);
      
      if (index >= 0) {
        // ถ้าเคยเซฟแล้ว (กดซ้ำ) -> ให้ลบออก (Unsave)
        userSaved.splice(index, 1);
      } else {
        // ถ้ายังไม่เคยเซฟ -> ให้เพิ่มเข้าไป (Save)
        userSaved.push(placeId);
      }
    }
  }
});

export const { toggleSavePlace } = savedPlacesSlice.actions;
export default savedPlacesSlice.reducer;