import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types"; 

interface UserState {
  users: User[];
}

// 🌟 เริ่มต้นด้วย Array ว่างเปล่า เพื่อรอรับข้อมูลจริงจาก Database
const initialState: UserState = {
  users: [],
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    // 🌟 รับข้อมูลทั้งหมดจาก API (Database) มาทับ State เดิม
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    // 🌟 เพิ่มข้อมูลลง State ทันที (หลังจากยิง API POST ผ่านแล้ว)
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    // 🌟 อัปเดตข้อมูลใน State ทันที (หลังจากยิง API PUT ผ่านแล้ว)
    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u: User) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    // 🌟 ลบข้อมูลออกจาก State ทันที (หลังจากยิง API DELETE ผ่านแล้ว)
    deleteUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u: User) => u.id !== action.payload);
    }
  }
});

export const { setUsers, addUser, updateUser, deleteUser } = userSlice.actions;
export default userSlice.reducer;