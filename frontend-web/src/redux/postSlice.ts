import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PartyActivity, ActivityStatus } from "../types";

const initialPosts: PartyActivity[] = [
  {
    id: "act_1",
    bookingId: "SUKRR-CM001",
    hostId: "u1",
    hostName: "พรกิชัย (Tee)",
    hostPhone: "0812345678",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
    title: "อยากหาเพื่อนไปกิน Copper วันนี้ครับ",
    description: "จองคิวไว้แล้ว 2 ที่ ขาดอีก 1 คน คุยเก่งกินเก่งทักมาครับ",
    category: "ร้านอาหาร",
    tags: ["บุฟเฟต์", "หาเพื่อนกิน"],
    placeId: "1",
    placeName: "Copper Beyond Buffet",
    meetingDate: new Date().toISOString().split("T")[0],
    meetingTime: "19:00",
    lat: 13.7750,
    lng: 100.4750,
    distance: "0.8 กม.",
    successRate: 92,
    sharedInterests: 4,
    joinedGuests: [{ userId: "u2", userName: "Mook", pax: 1, status: "pending" }],
    maxGuests: 1,
    status: "Open",
    createdAt: new Date().toISOString()
  }
];

const initialState: { posts: PartyActivity[] } = {
  posts: JSON.parse(localStorage.getItem("party_posts_db") || "null") || initialPosts
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    addPost: (state, action: PayloadAction<PartyActivity>) => {
      state.posts.push(action.payload);
      localStorage.setItem("party_posts_db", JSON.stringify(state.posts));
    },
    updatePostStatus: (state, action: PayloadAction<{ id: string; status: ActivityStatus }>) => {
      const post = state.posts.find(p => p.id === action.payload.id);
      if (post) {
        post.status = action.payload.status;
        localStorage.setItem("party_posts_db", JSON.stringify(state.posts));
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(p => p.id !== action.payload);
      localStorage.setItem("party_posts_db", JSON.stringify(state.posts));
    }
  }
});

export const { addPost, updatePostStatus, deletePost } = postSlice.actions;
export default postSlice.reducer;