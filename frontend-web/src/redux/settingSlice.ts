import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SettingsState } from "../types"; 

const defaultSettings: SettingsState = {
  businessName: "",
  phone: "",
  email: "",
  maxQueuePerDay: "",
  autoCancelMins: ""
};

const initialState: SettingsState = JSON.parse(localStorage.getItem("system_settings") || "null") || defaultSettings;

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings: (_state, action: PayloadAction<SettingsState>) => {
      const newState = { ...action.payload };
      localStorage.setItem("system_settings", JSON.stringify(newState));
      return newState;
    },
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      const newState = { ...state, ...action.payload };
      localStorage.setItem("system_settings", JSON.stringify(newState));
      return newState;
    }
  }
});

export const { setSettings, updateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;