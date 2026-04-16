import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types"; 

const initialUsers: User[] = [
  { id: "admin_1", name: "Super Admin", email: "admin@qbuddy.com", role: "ADMIN", status: "ACTIVE", createdAt: new Date().toISOString(), phone: "0800000000", ai_consented: true },
  { id: "staff_1", name: "Shop Staff", email: "staff@qbuddy.com", role: "STAFF", status: "ACTIVE", createdAt: new Date().toISOString(), phone: "0811111111", ai_consented: true },
  { id: "cus_1", name: "Alice Smith", email: "alice@example.com", role: "CUSTOMER", status: "ACTIVE", createdAt: new Date().toISOString(), phone: "0822222222", ai_consented: true }
];

const initialState = {
  users: JSON.parse(localStorage.getItem("system_users_unified") || "null") || initialUsers,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
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

export const { addUser, updateUser, deleteUser } = userSlice.actions;
export default userSlice.reducer;