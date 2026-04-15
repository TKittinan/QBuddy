import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ประกาศ Type เพื่อให้ TypeScript รู้จักโครงสร้างข้อมูลและป้องกัน Error
export interface TableType {
  id: string;
  label: string;
  capacity: number;
}

export interface Place {
  id: string;
  name: string;
  branch: string;
  category: string;
  reason?: string;
  description: string; // เพิ่มฟิลด์ description
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
  // หมวด: ร้านอาหาร
  {
    id: '1',
    name: 'Copper Beyond Buffet',
    branch: 'The Sense Pinklao',
    category: 'ร้านอาหาร',
    reason: 'บุฟเฟต์นานาชาติพรีเมียมอันดับ 1 ของไทย',
    description: 'สัมผัสประสบการณ์บุฟเฟต์นานาชาติระดับพรีเมียม ที่คัดสรรวัตถุดิบชั้นดีจากทั่วทุกมุมโลก พร้อมเสิร์ฟเมนูซิกเนเจอร์อย่างซุปทรัฟเฟิลและสเต็กวากิวในบรรยากาศหรูหรา',
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
    name: 'สุกี้ตี๋น้อย',
    branch: 'Major Ratchayothin',
    category: 'ร้านอาหาร',
    reason: 'อร่อยไม่อั้น เที่ยงวันยันเช้า',
    description: 'สุกี้ขวัญใจคนนอนดึก อร่อยคุ้มค่าด้วยวัตถุดิบสดใหม่ ทั้งเนื้อสไลด์ หมูสไลด์ ชีส และเมนูอื่นๆ อีกมากมาย ทานได้ไม่อั้นในราคาเป็นมิตร',
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
    name: 'Mo-Mo-Paradise',
    branch: 'Central World',
    category: 'ร้านอาหาร',
    reason: 'ชาบูชาบูและสุกี้ยากี้สไตล์ญี่ปุ่นแท้ๆ',
    description: 'สัมผัสรสชาติชาบูชาบูและสุกี้ยากี้แบบดั้งเดิมจากญี่ปุ่น โดดเด่นด้วยเนื้อวัวเกรดพรีเมียม หมูคุโรบูตะ และผักสดอนามัยที่คัดสรรมาอย่างดี',
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

  // หมวด: คาเฟ่
  {
    id: '4',
    name: 'After You Dessert Cafe',
    branch: 'Siam Paragon',
    category: 'คาเฟ่',
    reason: 'คากิโกริและโทสต์ยอดฮิตตลอดกาล',
    description: 'ร้านขนมหวานที่ครองใจทุกคนด้วยเมนูชิบูย่าฮันนี่โทสต์กรอบนอกนุ่มใน และคากิโกริเนื้อเนียนละเอียดละลายในปาก พร้อมเครื่องดื่มหลากหลาย',
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
    name: 'Nana Coffee Roasters',
    branch: 'Ari',
    category: 'คาเฟ่',
    reason: 'กาแฟ Specialty ระดับรางวัล บรรยากาศร่มรื่น',
    description: 'ดื่มด่ำกับกาแฟสเปเชียลตี้คั่วเองจากเมล็ดพันธุ์ชั้นเยี่ยมทั่วโลก ในบรรยากาศบ้านไม้ที่โอบล้อมด้วยสวนสีเขียวร่มรื่นใจกลางอารีย์',
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
  {
    id: '6',
    name: 'Factory Coffee',
    branch: 'Phayathai',
    category: 'คาเฟ่',
    reason: 'แชมป์บาริสต้าระดับประเทศ กาแฟรสชาติดีเยี่ยม',
    description: 'สัมผัสรสชาติกาแฟที่รังสรรค์โดยบาริสต้าระดับแชมป์ ด้วยเมนู Signature ที่ผสมผสานรสชาติอย่างลงตัวในสไตล์อินดัสเทรียลลอฟท์',
    tags: ['คาเฟ่'],
    distance: '6.2 กม.',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200',
    isRecommended: false,
    monthlyBookings: 2800,
    queueCount: 8,
    avgServiceTime: 45,
    openTime: '08:00',
    closeTime: '17:00',
    lat: 13.757272,
    lng: 100.534433,
    tableTypes: [
      { id: 't2', label: 'โต๊ะ 2 ท่าน', capacity: 2 },
      { id: 't4', label: 'โต๊ะ 4 ท่าน', capacity: 4 }
    ]
  },

  // หมวด: เสริมสวยอื่นๆ 
  {
    id: '7',
    name: 'Never Say Cutz',
    branch: 'Siam Square One',
    category: 'เสริมสวยอื่นๆ',
    reason: 'ร้านตัดผมชายสไตล์อเมริกันยอดฮิต',
    description: 'บาร์เบอร์ช็อปสไตล์อเมริกันสตรีทที่ให้บริการตัดผมชายสุดเนี๊ยบ ดำเนินงานโดยช่างผู้เชี่ยวชาญที่พร้อมออกแบบทรงผมให้เข้ากับคุณ',
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
  },
  {
    id: '8',
    name: 'Kantima Salon',
    branch: 'Siam Square',
    category: 'เสริมสวยอื่นๆ',
    reason: 'ซาลอนและร้านทำเล็บสุดคิวท์กลางสยาม',
    description: 'ร้านทำผมและทำเล็บสไตล์เกาหลีสีสันสดใส ให้บริการครบวงจรตั้งแต่ทำสี ดัดผม ไปจนถึงเพ้นท์เล็บเจลลายน่ารักๆ ในบรรยากาศเป็นกันเอง',
    tags: ['เสริมสวยอื่นๆ'],
    distance: '7.9 กม.',
    image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=200',
    isRecommended: false,
    monthlyBookings: 1200,
    queueCount: 2,
    avgServiceTime: 60,
    openTime: '10:00',
    closeTime: '20:00',
    lat: 13.744882,
    lng: 100.533221,
  },
  {
    id: '9',
    name: "Let's Relax Spa",
    branch: 'MBK Center',
    category: 'เสริมสวยอื่นๆ',
    reason: 'สปาและนวดแผนไทยพรีเมียมใจกลางเมือง',
    description: 'มอบรางวัลให้ตัวเองด้วยบริการนวดแผนไทยและสปาพรีเมียม ผ่อนคลายร่างกายและจิตใจด้วยเทคนิคการนวดเฉพาะตัวและสมุนไพรคุณภาพ',
    tags: ['เสริมสวยอื่นๆ'],
    distance: '8.0 กม.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500',
    logoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200',
    isRecommended: true,
    monthlyBookings: 2200,
    queueCount: 1,
    avgServiceTime: 120,
    openTime: '10:00',
    closeTime: '22:00',
    lat: 13.744388,
    lng: 100.529983,
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