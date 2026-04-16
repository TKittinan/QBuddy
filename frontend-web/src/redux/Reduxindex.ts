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

const loadPreloadedState = () => {
  try {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user"); 
    
    if (token && userJson) {
      const user = JSON.parse(userJson);
      return {
        auth: {
          token: token,
          user: user,
          role: user.role, 
          isAuthenticated: true,
          loading: false,
          error: null
        }
      };
    }
  } catch (e) {
    console.error("Could not load preloaded state", e);
  }
  return undefined;
};

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
  preloadedState: loadPreloadedState(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;