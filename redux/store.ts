import { configureStore } from '@reduxjs/toolkit';
import {
  userListenerMiddleware,
  userSlice,
} from '@/redux/features/user/userSlice';
import { fediApi } from '@/redux/features/api/fediApi';
import { setupListeners } from '@reduxjs/toolkit/query';

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    [fediApi.reducerPath]: fediApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userListenerMiddleware.middleware)
      .concat(fediApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
