import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SettingsState = {
  businessName: string;
  phone: string;
  email: string;
  maxQueuePerDay: string;
  autoCancelMins: string;
};

const defaultSettings: SettingsState = {
  businessName: "QBuddy Co., Ltd.",
  phone: "02-123-4567",
  email: "admin@qbuddy.com",
  maxQueuePerDay: "500",
  autoCancelMins: "15"
};

const initialState: SettingsState = JSON.parse(localStorage.getItem("system_settings") || "null") || defaultSettings;

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      const newState = { ...state, ...action.payload };
      localStorage.setItem("system_settings", JSON.stringify(newState));
      return newState;
    }
  }
});

export const { updateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;