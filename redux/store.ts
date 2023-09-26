import { configureStore } from "@reduxjs/toolkit";
import {userListenerMiddleware, userSlice} from "@/redux/features/user/userSlice";

export const store = configureStore({
    reducer: {
        user: userSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(userListenerMiddleware.middleware),
    devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;