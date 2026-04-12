import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types"; // สมมติว่ามี Type User อยู่

const initialUsers: User[] = [
  { id: "1", name: "Alice Smith", email: "alice@example.com", role: "CUSTOMER", status: "ACTIVE", createdAt: "Oct 12, 2023" },
  { id: "2", name: "Bob Johnson", email: "bob.j@example.com", role: "STAFF", status: "INACTIVE", createdAt: "Sep 20, 2023" },
];

const initialState = {
  users: JSON.parse(localStorage.getItem("system_users") || "null") || initialUsers,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
      localStorage.setItem("system_users", JSON.stringify(state.users));
    },
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u: User) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
        localStorage.setItem("system_users", JSON.stringify(state.users));
      }
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u: User) => u.id !== action.payload);
      localStorage.setItem("system_users", JSON.stringify(state.users));
    }
  }
});

export const { addUser, updateUser, deleteUser } = userSlice.actions;
export default userSlice.reducer;