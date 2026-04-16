import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types"; 

const initialState = {
  users: JSON.parse(localStorage.getItem("system_users_unified") || "[]"),
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // 🌟 เพิ่ม setUsers
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      localStorage.setItem("system_users_unified", JSON.stringify(state.users));
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
      localStorage.setItem("system_users_unified", JSON.stringify(state.users));
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u: User) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
        localStorage.setItem("system_users_unified", JSON.stringify(state.users));
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u: User) => u.id !== action.payload);
      localStorage.setItem("system_users_unified", JSON.stringify(state.users));
    }
  }
});

export const { setUsers, addUser, updateUser, deleteUser } = userSlice.actions;
export default userSlice.reducer;