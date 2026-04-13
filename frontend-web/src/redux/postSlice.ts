import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Post = {
  id: string;
  bookingId: string; // ใช้ Foreign Key เชื่อมไปยังตารางคิว/การจอง
  hostName: string; 
  hostPhone: string;
  placeName: string; 
  tags: string[];    
  meetingTime: string;
  distance: string;
  status: "Waiting" | "Completed" | "Cancelled"; // สถานะจะถูก Sync มาจากคิวอัตโนมัติโดย Backend
  description: string;
  createdAt: string;
};

const initialPosts: Post[] = [
  {
    id: "post_001", bookingId: "bk_001", hostName: "พรกิชัย (Tee)", hostPhone: "0812345678", placeName: "Copper Beyond Buffet",
    tags: ["ร้านอาหาร", "อีเวนท์"], meetingTime: "วันนี้ 19:00 น.", distance: "0.8 กม.",
    status: "Waiting", 
    description: "หาเพื่อนไปกิน Copper ครับ จองคิวไว้แล้ว 2 ที่ ขาดอีก 1 คน คุยเก่งกินเก่งทักมาครับ",
    createdAt: "10:30 AM"
  },
  {
    id: "post_002", bookingId: "bk_002", hostName: "เลิศสกุล", hostPhone: "0898765432", placeName: "Shabushi (Mega Bangna)",
    tags: ["ร้านอาหาร"], meetingTime: "พรุ่งนี้ 06:00 น.", distance: "1.5 กม.",
    status: "Completed", 
    description: "ไปกินชาบูกันตอนเช้าๆ ครับ หิวมาก",
    createdAt: "Yesterday"
  },
  {
    id: "post_003", bookingId: "bk_003", hostName: "ธีรภัทร", hostPhone: "0876543210", placeName: "ตี๋น้อย สุกี้",
    tags: ["ร้านอาหาร"], meetingTime: "วันนี้ 23:00 น.", distance: "2.3 กม.",
    status: "Waiting", 
    description: "หาเพื่อนกินสุกี้รอบดึกครับ คิวรันเร็วมาก",
    createdAt: "11:00 AM"
  },
  {
    id: "post_004", bookingId: "bk_004", hostName: "สมชาย", hostPhone: "0811111111", placeName: "Let's Relax Spa",
    tags: ["ร้านนวด"], meetingTime: "พรุ่งนี้ 14:00 น.", distance: "5.0 กม.",
    status: "Cancelled", 
    description: "หาเพื่อนไปนวดสปาครับ มีโปร 1 แถม 1",
    createdAt: "10:00 AM"
  }
];

const initialState = {
  posts: JSON.parse(localStorage.getItem("system_posts") || "null") || initialPosts,
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    // แอดมินมีสิทธิ์แค่ลบ (Moderate) โพสต์ที่ไม่เหมาะสมเท่านั้น
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((p: Post) => p.id !== action.payload);
      localStorage.setItem("system_posts", JSON.stringify(state.posts));
    }
  }
});

export const { deletePost } = postSlice.actions;
export default postSlice.reducer;