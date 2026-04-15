import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TableType {
  id: string;
  label: string;
  capacity: number;
}

export interface Place {
  id: string;
  placeId: string; 
  name: string;
  branch: string;
  category: string;
  reason?: string;
  description?: string;
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
  {
    id: '1',
    placeId: 'CB-RS-001', 
    name: 'Copper Beyond Buffet (The Sense Pinklao)',
    branch: 'The Sense Pinklao',
    category: 'ร้านอาหาร',
    reason: 'วิเคราะห์จากการจองร้านแนวบุฟเฟต์ของคุณ',
    description: 'สัมผัสประสบการณ์บุฟเฟต์นานาชาติระดับพรีเมียม',
    tags: ['ร้านอาหาร'],
    distance: '0.8 กม.',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=200',
    isRecommended: true,
    monthlyBookings: 4500,
    queueCount: 12,
    avgServiceTime: 15,
    openTime: '10:00',
    closeTime: '22:00',
    lat: 13.7750,
    lng: 100.4750,
    tableTypes: [
      { id: 't1', label: 'โต๊ะ 2 ท่าน', capacity: 2 },
      { id: 't2', label: 'โต๊ะ 4 ท่าน', capacity: 4 },
      { id: 't3', label: 'โต๊ะ 6-8 ท่าน', capacity: 8 }
    ]
  },
  {
    id: '2',
    placeId: 'SH-RS-002', 
    name: 'Shabushi Premium (Central World)',
    branch: 'Central World',
    category: 'ร้านอาหาร',
    reason: 'ร้านนี้กำลังเป็นที่นิยมในขณะนี้',
    description: 'สุกี้ขวัญใจคนนอนดึก อร่อยคุ้มค่าด้วยวัตถุดิบสดใหม่',
    tags: ['ร้านอาหาร'],
    distance: '2.5 กม.',
    image: 'https://images.unsplash.com/photo-1526462153549-36224314cfa8?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1526462153549-36224314cfa8?w=200',
    isRecommended: false,
    monthlyBookings: 3200,
    queueCount: 5,
    avgServiceTime: 10,
    openTime: '11:00',
    closeTime: '21:30',
    lat: 13.7468,
    lng: 100.5390,
    tableTypes: [
      { id: 'b1', label: 'บาร์เดี่ยว', capacity: 1 },
      { id: 't2', label: 'โต๊ะรวม 4 ท่าน', capacity: 4 }
    ]
  },
  {
    id: '3',
    placeId: 'SU-RS-003', 
    name: 'Suki Teenoi สุกี้ตี๋น้อย (Ratchayothin)',
    branch: 'Ratchayothin',
    category: 'ร้านอาหาร',
    reason: 'คุ้มค่าและเหมาะกับช่วงเวลาที่คุณค้นหา',
    description: 'สุกี้ขวัญใจคนนอนดึก อร่อยคุ้มค่าด้วยวัตถุดิบสดใหม่',
    tags: ['ร้านอาหาร'],
    distance: '4.2 กม.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200',
    isRecommended: true,
    monthlyBookings: 5500,
    queueCount: 24,
    avgServiceTime: 10,
    openTime: '12:00',
    closeTime: '05:00',
    lat: 13.8285,
    lng: 100.5698,
    tableTypes: [
      { id: 't2', label: 'โต๊ะ 2 ท่าน', capacity: 2 },
      { id: 't4', label: 'โต๊ะ 4-6 ท่าน', capacity: 6 }
    ]
  },
  {
    id: '4',
    placeId: 'AF-CF-001', 
    name: 'After You Dessert Cafe (Siam Paragon)',
    branch: 'Siam Paragon',
    category: 'คาเฟ่',
    reason: 'ของหวานยอดฮิตใกล้เคียงกับไลฟ์สไตล์คุณ',
    description: 'ร้านขนมหวานที่ครองใจทุกคนด้วยเมนูชิบูย่าฮันนี่โทสต์',
    tags: ['คาเฟ่'],
    distance: '3.0 กม.',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200',
    isRecommended: true,
    monthlyBookings: 5000,
    queueCount: 8,
    avgServiceTime: 5,
    openTime: '10:00',
    closeTime: '22:00',
    lat: 13.7460,
    lng: 100.5340,
    tableTypes: [
      { id: 't2', label: 'โต๊ะเล็ก 2 ท่าน', capacity: 2 },
      { id: 't4', label: 'โต๊ะใหญ่ 4 ท่าน', capacity: 4 }
    ]
  },
  {
    id: '5',
    placeId: 'RO-CF-002', 
    name: 'Roots Coffee (Sathorn)',
    branch: 'Sathorn',
    category: 'คาเฟ่',
    reason: 'ร้านกาแฟบรรยากาศดี',
    description: 'ดื่มด่ำกับกาแฟสเปเชียลตี้คั่วเองจากเมล็ดพันธุ์ชั้นเยี่ยม',
    tags: ['คาเฟ่'],
    distance: '5.1 กม.',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=200',
    isRecommended: false,
    monthlyBookings: 3100,
    queueCount: 2,
    avgServiceTime: 5,
    openTime: '08:00',
    closeTime: '19:30',
    lat: 13.7180,
    lng: 100.5280,
    tableTypes: [
      { id: 'b1', label: 'โซนบาร์ 1-2 ท่าน', capacity: 2 },
      { id: 'w1', label: 'โซนทำงาน 1 ท่าน', capacity: 1 }
    ]
  },
  {
    id: '6',
    placeId: 'VE-SA-001', 
    name: 'Veda Salon and Spa (Thonglor)',
    branch: 'Thonglor',
    category: 'Beauty',
    reason: 'บริการตัดผมและสปาครบวงจรที่คนรีวิวเยอะ',
    description: 'บาร์เบอร์ช็อปสไตล์อเมริกันสตรีทที่ให้บริการตัดผมชายสุดเนี๊ยบ',
    tags: ['Beauty'],
    distance: '1.2 กม.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200',
    isRecommended: true,
    monthlyBookings: 1200,
    queueCount: 3,
    avgServiceTime: 45,
    openTime: '10:00',
    closeTime: '20:00',
    lat: 13.7350,
    lng: 100.5820,
  },
  {
    id: '7',
    placeId: 'NA-SA-002', 
    name: 'Nail It Tokyo (Ari)',
    branch: 'Ari',
    category: 'Beauty',
    reason: 'บริการทำเล็บสไตล์ญี่ปุ่นเดินทางสะดวก',
    description: 'ร้านทำผมและทำเล็บสไตล์เกาหลีสีสันสดใส',
    tags: ['Beauty'],
    distance: '4.5 กม.',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=200',
    isRecommended: false,
    monthlyBookings: 900,
    queueCount: 1,
    avgServiceTime: 60,
    openTime: '11:00',
    closeTime: '21:00',
    lat: 13.7790,
    lng: 100.5440,
  },
  {
    id: '8',
    placeId: 'CL-SA-003',
    name: 'The Classic Barber (Silom)',
    branch: 'Silom',
    category: 'Beauty',
    reason: 'ร้านตัดผมชายที่คิวจองเต็มไวที่สุด',
    description: 'มอบรางวัลให้ตัวเองด้วยบริการนวดแผนไทยและสปาพรีเมียม',
    tags: ['Beauty'],
    distance: '2.0 กม.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200',
    isRecommended: true,
    monthlyBookings: 1500,
    queueCount: 4,
    avgServiceTime: 30,
    openTime: '10:00',
    closeTime: '20:00',
    lat: 13.7270,
    lng: 100.5250,
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