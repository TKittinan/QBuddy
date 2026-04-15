import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TableType {
  id: string;
  label: string;
  capacity: number;
}

export interface Place {
  id: string;
  placeId: string; // 🌟 เพิ่ม Type ให้รองรับ placeId
  name: string;
  branch: string;
  category: string;
  reason?: string;
  tags: string[];
  distance: string;
  image: string;
  logoUrl: string;
  isRecommended: boolean;
  monthlyBookings: number;
  queueCount: number;
  avgServiceTime: number;
  openTime: string;
  closeTime: string;
  lat: number;
  lng: number;
  tableTypes?: TableType[];
}

const MOCK_PLACES: Place[] = [
  // --- 🍽️ หมวด: ร้านอาหาร ---
  {
    id: '1',
    placeId: '#CT-R-001', // 🌟 Copper (C) + The Sense (T) - ร้านอาหาร (R) - สาขาที่ 1
    name: 'Copper Beyond Buffet',
    branch: 'The Sense Pinklao',
    category: 'ร้านอาหาร',
    reason: 'บุฟเฟต์นานาชาติพรีเมียมอันดับ 1 ของไทย',
    tags: ['ร้านอาหาร'],
    distance: '3.2 กม.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200',
    isRecommended: true,
    monthlyBookings: 8500,
    queueCount: 12,
    avgServiceTime: 120,
    openTime: '10:00',
    closeTime: '21:30',
    lat: 13.776916,
    lng: 100.475654,
    tableTypes: [
      { id: 't1', label: 'โต๊ะ 2 ท่าน', capacity: 2 },
      { id: 't2', label: 'โต๊ะ 4 ท่าน', capacity: 4 },
      { id: 't3', label: 'โต๊ะ 6-8 ท่าน', capacity: 8 }
    ]
  },
  {
    id: '2',
    placeId: '#สM-R-001', // 🌟 สุกี้ตี๋น้อย (ส) + Major (M)
    name: 'สุกี้ตี๋น้อย',
    branch: 'Major Ratchayothin',
    category: 'ร้านอาหาร',
    reason: 'อร่อยไม่อั้น เที่ยงวันยันเช้า',
    tags: ['ร้านอาหาร'],
    distance: '5.5 กม.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200',
    isRecommended: true,
    monthlyBookings: 12500,
    queueCount: 45,
    avgServiceTime: 120,
    openTime: '12:00',
    closeTime: '05:00',
    lat: 13.829983,
    lng: 100.568478,
    tableTypes: [
      { id: 't2', label: 'โต๊ะ 2 ท่าน', capacity: 2 },
      { id: 't4', label: 'โต๊ะ 4-6 ท่าน', capacity: 6 }
    ]
  },
  {
    id: '3',
    placeId: '#MC-R-001', // 🌟 Mo-Mo (M) + Central (C)
    name: 'Mo-Mo-Paradise',
    branch: 'Central World',
    category: 'ร้านอาหาร',
    reason: 'ชาบูชาบูและสุกี้ยากี้สไตล์ญี่ปุ่นแท้ๆ',
    tags: ['ร้านอาหาร'],
    distance: '8.1 กม.',
    image: 'https://images.unsplash.com/photo-1526462153549-36224314cfa8?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1526462153549-36224314cfa8?w=200',
    isRecommended: false,
    monthlyBookings: 6200,
    queueCount: 8,
    avgServiceTime: 100,
    openTime: '11:00',
    closeTime: '21:30',
    lat: 13.746356,
    lng: 100.539352,
    tableTypes: [
      { id: 't2', label: 'โต๊ะ 2-4 ท่าน', capacity: 4 },
      { id: 't6', label: 'โต๊ะ 5-6 ท่าน', capacity: 6 }
    ]
  },

  // --- ☕ หมวด: คาเฟ่ ---
  {
    id: '4',
    placeId: '#AS-C-001', // 🌟 After (A) + Siam (S)
    name: 'After You Dessert Cafe',
    branch: 'Siam Paragon',
    category: 'คาเฟ่',
    reason: 'คากิโกริและโทสต์ยอดฮิตตลอดกาล',
    tags: ['คาเฟ่'],
    distance: '7.5 กม.',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200',
    isRecommended: true,
    monthlyBookings: 5000,
    queueCount: 15,
    avgServiceTime: 45,
    openTime: '10:00',
    closeTime: '22:00',
    lat: 13.746687,
    lng: 100.534947,
    tableTypes: [
      { id: 't2', label: 'โต๊ะเล็ก 2 ท่าน', capacity: 2 },
      { id: 't4', label: 'โต๊ะ 3-4 ท่าน', capacity: 4 }
    ]
  },
  {
    id: '5',
    placeId: '#NA-C-001', // 🌟 Nana (N) + Ari (A)
    name: 'Nana Coffee Roasters',
    branch: 'Ari',
    category: 'คาเฟ่',
    reason: 'กาแฟ Specialty ระดับรางวัล บรรยากาศร่มรื่น',
    tags: ['คาเฟ่'],
    distance: '4.8 กม.',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=200',
    isRecommended: true,
    monthlyBookings: 3100,
    queueCount: 5,
    avgServiceTime: 60,
    openTime: '07:00',
    closeTime: '18:00',
    lat: 13.779774,
    lng: 100.543789,
    tableTypes: [
      { id: 'b1', label: 'โซนบาร์ 1 ท่าน', capacity: 1 },
      { id: 't2', label: 'โต๊ะสวน 2-3 ท่าน', capacity: 3 },
      { id: 't4', label: 'โต๊ะใหญ่ 4-6 ท่าน', capacity: 6 }
    ]
  },

  // --- 💇‍♀️ หมวด: เสริมสวยอื่นๆ ---
  {
    id: '7',
    placeId: '#NS-B-001', // 🌟 Never (N) + Siam (S)
    name: 'Never Say Cutz',
    branch: 'Siam Square One',
    category: 'เสริมสวยอื่นๆ',
    reason: 'ร้านตัดผมชายสไตล์อเมริกันยอดฮิต',
    tags: ['เสริมสวยอื่นๆ'],
    distance: '7.8 กม.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200',
    isRecommended: true,
    monthlyBookings: 1800,
    queueCount: 3,
    avgServiceTime: 45,
    openTime: '10:00',
    closeTime: '20:00',
    lat: 13.745582,
    lng: 100.534062,
  }
];

const placeSlice = createSlice({
  name: 'places',
  initialState: { places: MOCK_PLACES },
  reducers: {
    setPlaces: (state, action: PayloadAction<Place[]>) => { 
      state.places = action.payload; 
    }
  }
});

export const { setPlaces } = placeSlice.actions;
export default placeSlice.reducer;