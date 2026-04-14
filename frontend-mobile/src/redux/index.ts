import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import placesReducer from './slices/placeSlice';
import queueReducer from './slices/queueSlice';
import friendsReducer from './slices/friendSlice'; 
import chatReducer from './slices/aichatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    places: placesReducer,
    queue: queueReducer,
    friends: friendsReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;