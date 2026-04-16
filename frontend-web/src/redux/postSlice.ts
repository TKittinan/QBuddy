import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PartyActivity, ActivityStatus } from "../types";

const initialState: { posts: PartyActivity[] } = {
  posts: []
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<PartyActivity[]>) => {
      state.posts = action.payload;
    },
    addPost: (state, action: PayloadAction<PartyActivity>) => {
      state.posts.push(action.payload);
    },
    updatePostStatus: (state, action: PayloadAction<{ id: string; status: ActivityStatus }>) => {
      const post = state.posts.find(p => p.id === action.payload.id);
      if (post) {
        post.status = action.payload.status;
      }
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(p => p.id !== action.payload);
    }
  }
});

export const { setPosts, addPost, updatePostStatus, deletePost } = postSlice.actions;
export default postSlice.reducer;