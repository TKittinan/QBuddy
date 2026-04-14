import { configureStore } from "@reduxjs/toolkit";
import inboxReducer from "./inboxSlice";
import placeReducer from "./placeSlice";
import queueReducer from "./queueSlice";
import bookingReducer from "./bookingSlice";
import settingsReducer from "./settingSlice";
import userReducer from "./userSlice";
import staffReducer from "./staffSlice";
import postReducer from './postSlice';
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    inbox: inboxReducer,
    places: placeReducer,
    post: postReducer,
    queue: queueReducer,
    booking: bookingReducer,
    settings: settingsReducer,
    users: userReducer,
    auth: authReducer,
    staffs: staffReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
