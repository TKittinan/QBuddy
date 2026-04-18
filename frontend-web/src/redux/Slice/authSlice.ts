import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { API_BASE_URL } from "../../config";

interface AuthState {
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("user") || "null") : null,
  token: typeof window !== 'undefined' ? localStorage.getItem("token") : null,
  loading: false,
  error: null,
};

export const logoutAsync = createAsyncThunk(
  "auth/logout",
  async (_, { getState }) => {
    try {
      const state = getState() as any;
      const user = state.auth.user;

      if (user?.id) {
        await axios.put(`${API_BASE_URL}/users/${user.id}`, {
          ...user,
          status: "INACTIVE"
        });
      }
    } catch (error) {
      console.error("Failed to update status on logout", error);
    }
    return true; 
  }
);

export const loginAsync = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      const { token, user } = response.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      return { token, user };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action: PayloadAction<{ token: string; user: any }>) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (typeof window !== 'undefined') {
          window.location.href = "/login";
        }
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;