import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
    updateConsent: (state, action: PayloadAction<boolean>) => {
      if (state.user) state.user.ai_consented = action.payload; 
    }
  }
});

export const { loginSuccess, logout, updateConsent } = authSlice.actions;
export default authSlice.reducer;