import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { PartyActivity, Guest, ActivityStatus } from "../../types"; 
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
      
      const url = new URL(`${API_BASE_URL}/parties`); 
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
      
      const response = await axios.post(`${API_BASE_URL}/parties`, postData); 
      return response.data;
    } catch (error: any) {
      console.log("🚨 FULL API ERROR:", error.response?.data || error.message || error);
      return rejectWithValue(error.response?.data?.message || "Failed to add post");
    }
  }
);

export const joinPostAsync = createAsyncThunk(
  "post/joinPost",
  async (joinData: { activity_id: string; user_id: string; pax: number }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/parties/join`, joinData);
      return { ...joinData, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to join post");
    }
  }
);

export const updatePostStatus = createAsyncThunk(
  "post/updateStatus",
  async ({ id, status }: { id: string; status: ActivityStatus }, { rejectWithValue }) => {
    try {
      
      await axios.patch(`${API_BASE_URL}/parties/${id}/status`, { status });
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
    optimisticJoin: (state, action: PayloadAction<{activity_id: string; user_id: string; pax: number}>) => {
      const post = state.posts.find(p => p.id === action.payload.activity_id);
      if (post) {
        post.joinedGuests.push({ userId: action.payload.user_id, pax: action.payload.pax, status: 'pending' } as any);
      }
      if (!state.joinedPosts.includes(action.payload.activity_id)) {
        state.joinedPosts.push(action.payload.activity_id);
      }
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
        const { activity_id, user_id, pax, data } = action.payload;
        const index = state.posts.findIndex(p => p.id === activity_id);
        
        if (index !== -1 && !state.posts[index].joinedGuests.some((g: any) => g.userId === user_id)) {
           const newGuest = data || { userId: user_id, pax: pax, status: 'pending' };
           state.posts[index].joinedGuests.push(newGuest as any);
        }
        
        if (!state.joinedPosts.includes(activity_id)) {
          state.joinedPosts.push(activity_id);
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