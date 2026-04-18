import { configureStore } from "@reduxjs/toolkit";
import inboxReducer from "./Slice/inboxSlice";
import placeReducer from "./Slice/placeSlice";
import bookingReducer from "./Slice/bookingSlice";
import settingsReducer from "./Slice/settingSlice";
import userReducer from "./Slice/userSlice";
import postReducer from './Slice/postSlice';
import authReducer from "./Slice/authSlice";
import dashboardReducer from "./Slice/dashboardSlice";

export const store = configureStore({
  reducer: {
    inbox: inboxReducer,
    places: placeReducer,
    post: postReducer,
    booking: bookingReducer,
    settings: settingsReducer,
    users: userReducer,
    auth: authReducer,
    dashboard: dashboardReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;