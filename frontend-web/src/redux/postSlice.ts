import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../config";
import type { PartyActivity, ActivityStatus } from "../types";

//  1. AsyncThunk สำหรับดึงโพสต์กิจกรรมทั้งหมด
export const fetchPosts = createAsyncThunk("post/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/posts`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch posts");
  }
});

//  2. AsyncThunk สำหรับอัปเดตสถานะโพสต์ (เช่น Open -> Closed)
export const updatePostStatusAsync = createAsyncThunk(
  "post/updateStatus",
  async ({ id, status }: { id: string; status: ActivityStatus }, { rejectWithValue }) => {
    try {
      await axios.patch(`${API_BASE_URL}/posts/${id}/status`, { status });
      return { id, status };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update status");
    }
  }
);

//  3. AsyncThunk สำหรับลบโพสต์
export const deletePostAsync = createAsyncThunk("post/delete", async (id: string, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_BASE_URL}/posts/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete post");
  }
});

interface PostState {
  posts: PartyActivity[];
  loading: boolean;
  error: string | null;
}

const initialState: PostState = {
  posts: [],
  loading: false,
  error: null,
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        // เรียงโพสต์ใหม่ล่าสุดขึ้นก่อน
        state.posts = action.payload.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Status
      .addCase(updatePostStatusAsync.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.payload.id);
        if (post) {
          post.status = action.payload.status;
        }
      })
      // Delete Post
      .addCase(deletePostAsync.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p.id !== action.payload);
      });
  },
});

export default postSlice.reducer;