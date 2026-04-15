import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types";

const initialStaffs: User[] = [
  { id: "admin_1", name: "admin1", email: "admin1@qbuddy.com", password: "admin123", role: "ADMIN", status: "OFFLINE", createdAt: "Oct 01, 2023" },
  { id: "staff_1", name: "staff1", email: "staff1@qbuddy.com", password: "staff123", role: "STAFF", status: "ONLINE", createdAt: "Sep 20, 2023" },
];

const initialState = {
  staffs: JSON.parse(localStorage.getItem("system_staffs") || "null") || initialStaffs,
};

const staffSlice = createSlice({
  name: "staffs",
  initialState,
  reducers: {
    addStaff: (state, action: PayloadAction<User>) => {
      state.staffs.push(action.payload);
      localStorage.setItem("system_staffs", JSON.stringify(state.staffs));
    },
    updateStaff: (state, action: PayloadAction<User>) => {
      const index = state.staffs.findIndex((s: User) => s.id === action.payload.id);
      if (index !== -1) {
        state.staffs[index] = action.payload;
        localStorage.setItem("system_staffs", JSON.stringify(state.staffs));
      }
    },
    deleteStaff: (state, action: PayloadAction<string>) => {
      state.staffs = state.staffs.filter((s: User) => s.id !== action.payload);
      localStorage.setItem("system_staffs", JSON.stringify(state.staffs));
    }
  }
});

export const { addStaff, updateStaff, deleteStaff } = staffSlice.actions;
export default staffSlice.reducer;