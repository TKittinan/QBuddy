import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SettingsState } from "../types"; 

const initialState: SettingsState = {
  businessName: "",
  phone: "",
  email: "",
  maxQueuePerDay: "",
  autoCancelMins: ""
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings: (_state, action: PayloadAction<SettingsState>) => {
      return { ...action.payload };
    },
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload };
    }
  }
});

export const { setSettings, updateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;