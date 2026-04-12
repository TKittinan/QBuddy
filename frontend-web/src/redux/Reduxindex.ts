import { configureStore } from "@reduxjs/toolkit";
import inboxReducer from "./inboxSlice";
import placeReducer from "./placeSlice";
import queueReducer from "./queueSlice";
import bookingReducer from "./bookingSlice";
import settingsReducer from "./settingSlice";
import userReducer from "./userSlice";
import staffReducer from "./staffSlice";
import postReducer from './postSlice';

export const store = configureStore({
  reducer: {
    inbox: inboxReducer,
    places: placeReducer,
    post: postReducer,
    queue: queueReducer,
    booking: bookingReducer,
    settings: settingsReducer,
    users: userReducer,
    staffs: staffReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
