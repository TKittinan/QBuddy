import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import placeReducer from './slices/placeSlice';
import queueReducer from './slices/queueSlice';
import friendReducer from './slices/friendSlice';
import aichatReducer from './slices/aichatSlice';
import chatReducer from './slices/chatSlice';
import savedPlacesReducer from './slices/savedPlacesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    places: placeReducer,
    queue: queueReducer,
    friends: friendReducer,
    aichat: aichatReducer, 
    chat: chatReducer, 
    savedPlaces: savedPlacesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;