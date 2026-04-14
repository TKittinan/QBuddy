import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const MOCK_PLACES = Array.from({ length: 30 }).map((_, i) => ({
  id: `${i + 1}`,
  name: i === 0 ? 'Copper Beyond Buffet' : i === 1 ? 'Shabushi Premium' : `ร้านอร่อยสาขาที่ ${i + 1}`,
  branch: i === 0 ? 'The Sense' : 'Central World',
  category: i % 2 === 0 ? 'ร้านอาหาร' : 'คาเฟ่',
  type: i % 2 === 0 ? 'buffet' : 'cafe',
  reason: i % 3 === 0 ? 'เพราะคุณชอบปิ้งย่างในช่วงเย็น' : 'ใกล้เคียงกับร้านที่คุณเคยจอง',
  tags: ['ปิ้งย่าง', 'ชาบู', 'คาเฟ่', 'ญี่ปุ่น'].sort(() => 0.5 - Math.random()).slice(0, 2),
  rating: +(4 + Math.random()).toFixed(1),
  reviews: Math.floor(Math.random() * 2000) + 100,
  distance: `${(Math.random() * 5).toFixed(1)} กม.`,
  image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=500&q=80`,
  logoUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200',
  isRecommended: i % 4 === 0,
  promo: i % 5 === 0 ? '-20%' : null,
  queueCount: Math.floor(Math.random() * 100),
  monthlyBookings: Math.floor(Math.random() * 5000) + 1000 - (i * 100),
  avgServiceTime: 15,
  lat: 13.75 + (Math.random() * 0.1),
  lng: 100.51 + (Math.random() * 0.1),
  status: i % 3 === 0 ? 'busy' : 'available',
  waitTime: `รอคิว ${Math.floor(Math.random() * 30)} นาที`
}));

const placeSlice = createSlice({
  name: 'places',
  initialState: { places: MOCK_PLACES },
  reducers: {
    setPlaces: (state, action) => { state.places = action.payload; }
  }
});
export const { setPlaces } = placeSlice.actions;
export default placeSlice.reducer;