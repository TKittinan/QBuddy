import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { PartyActivity, Guest, ActivityStatus } from "../../types"; 
// 🌟 1. นำเข้า API_BASE_URL
import { API_BASE_URL } from "../../config";

interface PostState {
  posts: PartyActivity[];
  joinedPosts: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PostState = {
  posts: [],
  joinedPosts: [],
  isLoading: false,
  error: null,
};

export const fetchPostsAsync = createAsyncThunk(
  "post/fetchPosts",
  async (params: { lat?: number; lng?: number; userId?: string } | void, { rejectWithValue }) => {
    try {
      // 🌟 2. ใช้ API_BASE_URL
      const url = new URL(`${API_BASE_URL}/posts`);
      if (params) {
        if (params.lat) url.searchParams.set('lat', String(params.lat));
        if (params.lng) url.searchParams.set('lng', String(params.lng));
        if (params.userId) url.searchParams.set('userId', params.userId);
      }

      const response = await axios.get(url.toString());
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to load posts");
    }
  }
);

export const addPostAsync = createAsyncThunk(
  "post/addPost",
  async (postData: Partial<PartyActivity>, { rejectWithValue }) => {
    try {
      // 🌟 3. ใช้ API_BASE_URL
      const response = await axios.post(`${API_BASE_URL}/posts`, postData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to add post");
    }
  }
);

export const joinPostAsync = createAsyncThunk(
  "post/joinPost",
  async (data: { postId: string; guest: Guest }, { rejectWithValue }) => {
    try {
      // 🌟 4. ใช้ API_BASE_URL
      const response = await axios.post(`${API_BASE_URL}/posts/${data.postId}/join`, data.guest);
      return { postId: data.postId, guest: data.guest, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to join post");
    }
  }
);

export const updatePostStatus = createAsyncThunk(
  "post/updateStatus",
  async ({ id, status }: { id: string; status: ActivityStatus }, { rejectWithValue }) => {
    try {
      // 🌟 5. ใช้ API_BASE_URL
      await axios.patch(`${API_BASE_URL}/posts/${id}/status`, { status });
      return { id, status };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
    }
  }
);

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    addJoinedPost: (state, action: PayloadAction<string>) => {
      if (!state.joinedPosts.includes(action.payload)) {
        state.joinedPosts.push(action.payload);
      }
    },
    optimisticJoin: (state, action: PayloadAction<{postId: string, guest: Guest}>) => {
      const post = state.posts.find(p => p.id === action.payload.postId);
      if (post) post.joinedGuests.push({ ...action.payload.guest, status: 'pending' });
      if (!state.joinedPosts.includes(action.payload.postId)) state.joinedPosts.push(action.payload.postId);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        // 🌟 ดักจับ Array ป้องกันหน้าจอขาว
        state.posts = Array.isArray(action.payload) ? action.payload : (action.payload?.data || []);
      })
      .addCase(fetchPostsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addPostAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addPostAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const newPost = action.payload?.data || action.payload;
        state.posts.push(newPost);
      })
      .addCase(addPostAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(joinPostAsync.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p.id === action.payload.postId);
        if (index !== -1 && !state.posts[index].joinedGuests.some(g => g.userId === action.payload.guest.userId)) {
           state.posts[index].joinedGuests.push(action.payload.guest);
        }
        if (!state.joinedPosts.includes(action.payload.postId)) {
          state.joinedPosts.push(action.payload.postId);
        }
      })
      .addCase(updatePostStatus.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.payload.id);
        if (post) post.status = action.payload.status;
      });
  }
});

export const { addJoinedPost, optimisticJoin } = postSlice.actions;
export default postSlice.reducer;