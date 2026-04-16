import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { PartyActivity, Guest, ActivityStatus } from "../../types";

const API_URL = "http://192.168.1.X:5000/api/posts";

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
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Fetch error");
    }
  }
);

export const addPostAsync = createAsyncThunk(
  "post/addPost",
  async (postData: PartyActivity, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, postData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Add error");
    }
  }
);

export const joinPostAsync = createAsyncThunk(
  "post/joinPost",
  async ({ postId, guest }: { postId: string; guest: Omit<Guest, 'status'> }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/${postId}/join`, guest);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Join error");
    }
  }
);

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
      if (post) post.status = action.payload.status;
    },
    deletePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter(p => p.id !== action.payload);
    },
    joinPost: (state, action: PayloadAction<{postId: string, guest: Omit<Guest, 'status'>}>) => {
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
        state.posts = action.payload;
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
        state.posts.push(action.payload);
      })
      .addCase(addPostAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(joinPostAsync.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) state.posts[index] = action.payload;
      });
  }
});

export const { setPosts, addPost, updatePostStatus, deletePost, joinPost } = postSlice.actions;
export default postSlice.reducer;